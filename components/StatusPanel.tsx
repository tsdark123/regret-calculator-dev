import React from "react";
import {
  Table, TableBody, TableCell,
  TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const statusItems = [
  { name: "Web Servers (US-East)", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Web Servers (EU-West)", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "CDN & Asset Delivery", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Backend API", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Database (Primary)", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Database (Replica)", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Firebase Realtime DB", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Market Data", status: "Static", statusColor: "bg-amber-500" },
  { name: "Compound Engine v2", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Opportunity Cost Model", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "S&P 500 Returns", status: "Static", statusColor: "bg-amber-500" },
  { name: "Auth & Session Tokens", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Analytics Pipeline", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "PNG Export Service", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Front-End (Desktop)", status: "Operational", statusColor: "bg-emerald-500" },
  { name: "Front-End (Mobile)", status: "In Development", statusColor: "bg-amber-500" },
  { name: "Social Features", status: "Building", statusColor: "bg-blue-500" },
  { name: "AI Analysis Engine", status: "Coming Soon", statusColor: "bg-purple-500" },
];

export const StatusPanel: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col select-none">
      <style>{`
        .status-panel-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .status-panel-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .status-panel-scroll::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.3);
          border-radius: 2px;
        }
        .status-panel-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
      `}</style>
      <div className="bg-[var(--bg-card)] border border-[var(--border)] shadow-sm rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 select-none bg-[var(--bg-hover)]/30 border-b border-gray-500/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-2 h-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <span className="text-[15px] font-semibold text-[var(--text-main)]/90 tracking-tight">
              System Status
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            All Systems Normal
          </span>
        </div>

        {/* Table */}
        <div className="p-4 flex-1 flex flex-col overflow-y-auto status-panel-scroll">
          <Table>
            <TableHeader>
              <TableRow className="border-[var(--border)]">
                <TableHead className="text-[var(--text-muted)]">Service</TableHead>
                <TableHead className="text-[var(--text-muted)]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusItems.map((item) => (
                <TableRow key={item.name} className="border-[var(--border)] hover:bg-[var(--bg-hover)]/50">
                  <TableCell className="font-medium text-[var(--text-main)] py-2.5">{item.name}</TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden="true" className={`size-1.5 rounded-full flex-shrink-0 ${item.statusColor}`} />
                      <span className="text-sm text-[var(--text-muted)]">{item.status}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="border-[var(--border)] bg-[var(--bg-hover)]/30">
              <TableRow className="border-none hover:bg-transparent">
                <TableCell className="text-[var(--text-muted)] text-xs">Last checked</TableCell>
                <TableCell className="text-[var(--text-muted)] text-xs text-right">
                  {new Date().toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} today
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
};
