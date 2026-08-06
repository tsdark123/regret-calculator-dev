import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const STOCK_DATA_PATH = path.join(ROOT, 'src/data/stockData.json');
const RETURNS_PATH = path.join(ROOT, 'src/data/stockReturns.json');
const CHECKPOINT_PATH = path.join(ROOT, 'scripts/.checkpoint.json');

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;
const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

const BATCH_SIZE = 25; // Alpha Vantage free daily limit
const STALE_DAYS = 30;
const MIN_API_WINDOW_YEARS = 1;
const DEFAULT_WINDOW_YEARS = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadJSON(filePath, fallback = undefined) {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT' && fallback !== undefined) return fallback;
    throw err;
  }
}

async function saveJSON(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr);
  const now = new Date();
  return (now - then) / (1000 * 60 * 60 * 24);
}

async function initFirebase() {
  if (!FIREBASE_DATABASE_URL || !FIREBASE_SERVICE_ACCOUNT_PATH) {
    return null;
  }
  try {
    const { initializeApp, cert } = await import('firebase-admin/app');
    const { getDatabase } = await import('firebase-admin/database');
    const serviceAccount = await loadJSON(path.resolve(ROOT, FIREBASE_SERVICE_ACCOUNT_PATH));
    const app = initializeApp(
      { credential: cert(serviceAccount), databaseURL: FIREBASE_DATABASE_URL },
      'refresh-script'
    );
    return getDatabase(app);
  } catch (err) {
    console.warn('Firebase not initialized:', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Alpha Vantage fetch
// ---------------------------------------------------------------------------

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry(url, retries = 3, delay = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      // Alpha Vantage throttling / info message returns 200 with a "Note" or "Information" field
      if (text.includes('"Note"') || text.includes('"Information"') || text.includes('call frequency')) {
        throw new Error(`Alpha Vantage rate/info response: ${text.slice(0, 200)}`);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return JSON.parse(text);
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`  attempt ${i + 1} failed, retrying...`);
      await sleep(delay * (i + 1));
    }
  }
  throw new Error('unreachable');
}

function pickAdjustedClose(data, symbol, type) {
  if (!data || typeof data !== 'object') return null;

  if (type === 'Crypto') {
    const series = data['Time Series (Digital Currency Monthly)'];
    if (!series) return null;
    const entries = Object.entries(series)
      .map(([date, values]) => ({
        date,
        close: parseFloat(values['4a. close (USD)'] ?? values['4. close']),
      }))
      .filter((e) => !Number.isNaN(e.close))
      .sort((a, b) => b.date.localeCompare(a.date));
    return entries;
  }

  const series = data['Monthly Adjusted Time Series'];
  if (!series) return null;
  const entries = Object.entries(series)
    .map(([date, values]) => ({
      date,
      close: parseFloat(values['5. adjusted close'] ?? values['4. close']),
    }))
    .filter((e) => !Number.isNaN(e.close))
    .sort((a, b) => b.date.localeCompare(a.date));
  return entries;
}

function computeCAGR(entries) {
  if (!entries || entries.length < 2) return null;
  const latest = entries[0];
  // Try to get a point ~10 years ago, or the oldest available
  const targetDate = new Date(latest.date);
  targetDate.setFullYear(targetDate.getFullYear() - DEFAULT_WINDOW_YEARS);
  const targetStr = targetDate.toISOString().split('T')[0];

  // find the first entry at or before the target
  let startEntry = entries.find((e) => e.date <= targetStr);
  if (!startEntry) {
    startEntry = entries[entries.length - 1]; // oldest available
  }

  const years = (new Date(latest.date) - new Date(startEntry.date)) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < MIN_API_WINDOW_YEARS) return null;

  const cagr = Math.pow(latest.close / startEntry.close, 1 / years) - 1;
  return {
    avgReturn: Math.round(cagr * 1000) / 10, // 1 decimal
    windowYears: Math.round(years * 10) / 10,
    asOf: formatDate(new Date()),
    startDate: startEntry.date,
    endDate: latest.date,
    source: 'Alpha Vantage',
  };
}

async function refreshAsset(asset) {
  const symbol = asset.symbol;
  const isCrypto = asset.type === 'Crypto';
  const functionName = isCrypto ? 'DIGITAL_CURRENCY_MONTHLY' : 'TIME_SERIES_MONTHLY_ADJUSTED';
  let url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}&apikey=${API_KEY}`;
  if (isCrypto) {
    url += '&market=USD';
  }

  const data = await fetchWithRetry(url);
  const entries = pickAdjustedClose(data, symbol, asset.type);
  if (!entries || entries.length < 2) {
    throw new Error(`no usable time series data for ${symbol}`);
  }
  return computeCAGR(entries);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!API_KEY) {
    console.error('Missing ALPHA_VANTAGE_API_KEY. Set it in .env or environment.');
    process.exit(1);
  }

  const stockData = await loadJSON(STOCK_DATA_PATH);
  const returns = await loadJSON(RETURNS_PATH, { lastUpdated: null, source: 'Alpha Vantage', returns: {} });
  const checkpoint = await loadJSON(CHECKPOINT_PATH, { index: 0, lastRun: null, callsToday: 0, date: null });

  const today = formatDate(new Date());
  if (checkpoint.date !== today) {
    checkpoint.callsToday = 0;
    checkpoint.date = today;
  }

  // Determine stalest assets, but if we hit the daily cap we resume later.
  const assetsToRefresh = stockData
    .map((asset) => {
      const record = returns.returns[asset.symbol];
      const age = record?.asOf ? daysSince(record.asOf) : Infinity;
      return { ...asset, record, age };
    })
    .filter((a) => a.age >= STALE_DAYS)
    .sort((a, b) => b.age - a.age);

  // Allow a manual run limit, e.g. `node scripts/refresh-stocks.mjs --limit=3`
  const limitFlag = process.argv.find((arg) => arg.startsWith('--limit='));
  const manualLimit = limitFlag ? parseInt(limitFlag.split('=')[1], 10) : Infinity;
  const remainingBudget = BATCH_SIZE - checkpoint.callsToday;
  const batch = assetsToRefresh.slice(0, Math.min(remainingBudget, manualLimit));

  if (batch.length === 0) {
    console.log('No stale assets to refresh today.');
    return;
  }

  if (checkpoint.callsToday >= BATCH_SIZE) {
    console.log(`Daily Alpha Vantage limit (${BATCH_SIZE}) already reached. Run again tomorrow.`);
    return;
  }

  console.log(`Refreshing ${batch.length} asset(s) (daily budget remaining: ${BATCH_SIZE - checkpoint.callsToday})...`);

  const db = await initFirebase();
  let pushedToFirebase = 0;

  for (const asset of batch) {
    try {
      const result = await refreshAsset(asset);
      returns.returns[asset.symbol] = result;
      console.log(`  ${asset.symbol}: ${result.avgReturn}% (${result.windowYears}yr, ${result.startDate} → ${result.endDate})`);

      if (db) {
        const ref = db.ref(`/marketData/stocks/${asset.symbol}`);
        await ref.set({
          ...result,
          name: asset.name,
          type: asset.type,
          sector: asset.sector,
          symbol: asset.symbol,
          color: asset.color,
        });
        pushedToFirebase++;
      }

      checkpoint.callsToday++;
    } catch (err) {
      console.error(`  ${asset.symbol}: ${err.message}`);
      // If rate-limited, stop and save progress
      if (err.message.includes('rate') || err.message.includes('call frequency') || err.message.includes('limit')) {
        console.log('Rate limit encountered. Saving checkpoint.');
        break;
      }
    }
    // Be polite: Alpha Vantage free tier enforces ~5 calls/min, so wait 12s.
    await sleep(12000);
  }

  returns.lastUpdated = formatDate(new Date());
  returns.source = 'Alpha Vantage';
  await saveJSON(RETURNS_PATH, returns);

  checkpoint.index = (checkpoint.index + batch.length) % stockData.length;
  checkpoint.lastRun = formatDate(new Date());
  await saveJSON(CHECKPOINT_PATH, checkpoint);

  console.log(`Done. Updated ${Object.keys(returns.returns).length} total symbol(s).`);
  if (db) console.log(`Pushed ${pushedToFirebase} update(s) to Firebase RTDB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
