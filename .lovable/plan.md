

# Fix: Ocean Theme Dropdown Button Styling

## Problem Identified

The dropdown button in the "Head-to-Head Battle" section is not applying the correct Ocean theme styling because of a **theme name mismatch**:

- The actual theme value is `'blue'` (as defined in `types.ts`)
- The code is checking for `theme === 'ocean'` which is **never true**
- This causes the button to always fall back to the dark theme styling (`bg-black/25`)

## Solution

Update the conditional checks in `ComparisonBattle.tsx` to use `theme === 'blue'` instead of `theme === 'ocean'`, and apply the glossy glass styling you requested.

## Changes to Make

### File: `components/ComparisonBattle.tsx`

**1. Fix the dropdown trigger button (around line 273-276)**

Change the theme check from `'ocean'` to `'blue'` and apply the glossy glass styling:

```tsx
// Before (broken - checking for wrong theme name)
${theme === 'ocean' 
  ? 'bg-white/30 border border-white/60 backdrop-blur-md shadow-sm text-slate-800 hover:bg-white/40' 
  : 'bg-black/25 border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]/30'
}

// After (fixed)
${theme === 'blue' 
  ? '!bg-white/30 !border !border-white/80 backdrop-blur-md shadow-sm !text-blue-900 hover:!bg-white/40' 
  : 'bg-black/25 border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]/30'
}
```

**2. Fix the dropdown menu (around line 300-302)**

Apply matching glossy glass styling for the dropdown menu in the blue/Ocean theme:

```tsx
// Before
bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl

// After - with theme-conditional glass effect
${theme === 'blue'
  ? 'bg-white/90 border border-white/80 backdrop-blur-lg'
  : 'bg-[var(--bg-card)] border border-[var(--border)]'
} rounded-2xl shadow-2xl
```

**3. Fix any other `theme === 'ocean'` checks in the file**

There's also a logo inversion check that needs updating:
- Line 284: `${selectedChallenger.needsInvert && theme === 'ocean' ? 'invert' : ''}`
- Line 328: `${option.needsInvert && theme === 'ocean' ? 'invert' : ''}`

Both should be changed to `theme === 'blue'`.

## Technical Details

| Element | Ocean/Blue Theme Styling |
|---------|-------------------------|
| Button Background | `!bg-white/30` (transparent white) |
| Button Border | `!border-white/80` (light border) |
| Button Text | `!text-blue-900` (dark blue for contrast) |
| Glass Effect | `backdrop-blur-md` |
| Dropdown Menu | `bg-white/90 backdrop-blur-lg` |

The `!` prefix (important modifier) ensures these styles override any conflicting global styles.

## Expected Result

After this fix:
- The "Cigarettes" dropdown button will appear as a glossy, transparent white button in Ocean/light mode
- Text will be crisp dark blue for perfect readability
- The dropdown menu will have a matching glass aesthetic
- Matrix and Default themes will remain unchanged

