import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Role = "authority" | "recipient" | "admin" | "investigator";
type User = { username: string; name: string; role: Role; recipientId?: string };
type Doc = { id: string; title: string; file: string; classification: string; size: string; recipients: number; created: string; state: string };
type Recipient = { id: string; name: string; handle: string };
type DecryptionEvent = { id: string; document: string; recipient: string; session: string; watermark: string; timestamp: string; state: string; block: number };
type LedgerBlock = { block: number; event: string; previous: string; eventHash: string; current: string; timestamp: string; real: boolean };

const users: User[] = [
  { username: "authority", name: "Release authority", role: "authority" },
  { username: "ananya", name: "Ananya Sharma", role: "recipient", recipientId: "REC-003" },
  { username: "rahul", name: "Rahul Mehta", role: "recipient", recipientId: "REC-004" },
  { username: "vikram", name: "Vikram Singh", role: "recipient", recipientId: "REC-005" },
  { username: "admin", name: "Security operations", role: "admin" },
  { username: "investigator", name: "Forensic desk", role: "investigator" },
];
const recipients: Recipient[] = [
  { id: "REC-003", name: "Ananya Sharma", handle: "ananya" },
  { id: "REC-004", name: "Rahul Mehta", handle: "rahul" },
  { id: "REC-005", name: "Vikram Singh", handle: "vikram" },
];
const baseDocs: Doc[] = [
  { id: "DOC-2026-001", title: "Strategic Operations Report", file: "Strategic_Operations_Report.pdf", classification: "RESTRICTED", size: "4.8 MB", recipients: 3, created: "18 Sep 2026", state: "RELEASED" },
  { id: "DOC-2026-002", title: "Infrastructure Security Brief", file: "Infrastructure_Security_Brief.pdf", classification: "CONFIDENTIAL", size: "2.1 MB", recipients: 2, created: "15 Sep 2026", state: "RELEASED" },
  { id: "DOC-2026-003", title: "Mission Logistics Report", file: "Mission_Logistics_Report.pdf", classification: "RESTRICTED", size: "6.2 MB", recipients: 1, created: "08 Sep 2026", state: "ARCHIVED" },
];
const initialEvents: DecryptionEvent[] = [
  { id: "DEC-000184", document: "DOC-2026-001", recipient: "REC-003", session: "SES-20260926-8F3A", watermark: "WM-7F83A2B9", timestamp: "26 Sep 2026 16:31:44", state: "RECORDED", block: 184 },
  { id: "DEC-000183", document: "DOC-2026-002", recipient: "REC-004", session: "SES-20260926-5C1E", watermark: "WM-4B91E028", timestamp: "26 Sep 2026 15:42:19", state: "VERIFIED", block: 183 },
  { id: "DEC-000182", document: "DOC-2026-001", recipient: "REC-005", session: "SES-20260926-3A9F", watermark: "WM-9F22D68C", timestamp: "26 Sep 2026 14:55:02", state: "RECORDED", block: 182 },
  { id: "DEC-000181", document: "DOC-2026-002", recipient: "REC-003", session: "SES-20260926-1E8D", watermark: "WM-3C48A17F", timestamp: "26 Sep 2026 14:18:27", state: "VERIFIED", block: 181 },
];
const eventSeed = initialEvents[0];

// Placeholder seed used before async SHA-256 chain is computed.
// Real hashes are generated in AppStateProvider via Web Crypto API.
const BLOCK_TIMESTAMPS = [
  "26 Sep 2026 14:12:08",
  "26 Sep 2026 14:19:08",
  "26 Sep 2026 15:26:08",
  "26 Sep 2026 15:33:08",
  "26 Sep 2026 16:40:08",
];
const BLOCK_EVENTS = ["DEC-000181", "DEC-000182", "DEC-000183", "DEC-000184", "DEC-000185"];

async function sha256hex(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data);
  const buf = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Build a real SHA-256 chained ledger for blocks 181–185.
async function buildLedgerChain(): Promise<LedgerBlock[]> {
  const GENESIS = "0000000000000000000000000000000000000000000000000000000000000000";
  const blocks: LedgerBlock[] = [];
  let prevHash = GENESIS;
  for (let i = 0; i < 5; i++) {
    const blockNum = 181 + i;
    const evt = BLOCK_EVENTS[i];
    const ts = BLOCK_TIMESTAMPS[i];
    // Event hash = SHA-256(event_id + ":" + block_number)
    const eventHash = await sha256hex(`${evt}:${blockNum}`);
    // Current block hash = SHA-256(previous + ":" + event_hash + ":" + timestamp)
    const current = await sha256hex(`${prevHash}:${eventHash}:${ts}`);
    blocks.push({ block: blockNum, event: evt, previous: prevHash, eventHash, current, timestamp: ts, real: true });
    prevHash = current;
  }
  return blocks;
}

// Placeholder ledger (shown briefly before async hashes load)
const placeholderLedger: LedgerBlock[] = [181, 182, 183, 184, 185].map((block, index) => ({
  block, event: BLOCK_EVENTS[index],
  previous: index === 0 ? "computing…" : "computing…",
  eventHash: "computing…",
  current: "computing…",
  timestamp: BLOCK_TIMESTAMPS[index],
  real: false,
}));

type AppState = {
  docs: Doc[];
  recipients: Recipient[];
  distributions: { id: string; document: string; status: string }[];
  events: DecryptionEvent[];
  watermarks: { id: string; event: string; status: string }[];
  ledger: LedgerBlock[];
  ledgerReady: boolean;
  released: boolean;
  tampered: boolean;
  investigations: { id: string; file: string; status: string; recipient: string }[];
  reports: { id: string; document: string; match: string; date: string; status: string }[];
  release: () => void;
  recordDecryption: (recipientId: string) => void;
  setTampered: (value: boolean) => void;
};
const AppStateContext = createContext<AppState | null>(null);
function useApp() {
  const state = useContext(AppStateContext);
  if (!state) throw new Error("SDMS application state is unavailable");
  return state;
}
function AppStateProvider({ children }: { children: ReactNode }) {
  const [released, setReleased] = useState(false);
  const [tampered, setTampered] = useState(false);
  const [events, setEvents] = useState<DecryptionEvent[]>(initialEvents);
  const [investigations] = useState([{ id: "INV-20260926-014", file: "Strategic_Operations_Report_leaked.pdf", status: "MATCHED", recipient: "Ananya Sharma" }]);
  const [ledger, setLedger] = useState<LedgerBlock[]>(placeholderLedger);
  const [ledgerReady, setLedgerReady] = useState(false);

  // Build real SHA-256 chain once on mount using Web Crypto API.
  useEffect(() => {
    let cancelled = false;
    buildLedgerChain().then((chain) => {
      if (!cancelled) { setLedger(chain); setLedgerReady(true); }
    });
    return () => { cancelled = true; };
  }, []);

  const release = () => setReleased(true);
  const recordDecryption = (recipientId: string) => {
    if (recipientId === "REC-003" || events.some((event) => event.recipient === recipientId)) return;
    setEvents((old) => [...old, { ...eventSeed, id: `DEC-000${185 + old.length}`, recipient: recipientId, state: "RECORDED" }]);
  };
  const value = useMemo<AppState>(() => ({
    docs: baseDocs.map((doc) => doc.id === "DOC-2026-001" && released ? { ...doc, state: "RELEASED" } : doc),
    recipients,
    distributions: [{ id: "REL-2026-004", document: "DOC-2026-001", status: released ? "RELEASED" : "STAGED" }],
    events,
    watermarks: [{ id: "WM-7F83A2B9", event: "DEC-000184", status: "MATCHED" }],
    ledger, ledgerReady, released, tampered, investigations,
    reports: [{ id: "INV-20260926-014", document: "Strategic Operations Report", match: "REC-003", date: "26 Sep 2026", status: "READY" }, { id: "INV-20260918-007", document: "Infrastructure Security Brief", match: "REC-004", date: "18 Sep 2026", status: "READY" }],
    release, recordDecryption, setTampered,
  }), [events, ledger, ledgerReady, released, tampered, investigations]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

const roleMeta: Record<Role, { label: string; home: string; links: { label: string; href: string }[] }> = {
  authority: { label: "DOCUMENT AUTHORITY", home: "/authority/dashboard", links: [{ label: "Operations", href: "/authority/dashboard" }, { label: "Documents", href: "/authority/documents" }, { label: "Distributions", href: "/authority/distributions/new" }, { label: "History", href: "/authority/history" }] },
  recipient: { label: "RECIPIENT", home: "/recipient/dashboard", links: [{ label: "Operations", href: "/recipient/dashboard" }, { label: "Documents", href: "/recipient/documents" }, { label: "History", href: "/recipient/history" }] },
  admin: { label: "SECURITY ADMINISTRATION", home: "/admin/dashboard", links: [{ label: "Operations", href: "/admin/dashboard" }, { label: "Events", href: "/admin/events" }, { label: "PQC / Identity", href: "/admin/pqc" }, { label: "Private ledger", href: "/admin/ledger" }, { label: "Health", href: "/admin/health" }] },
  investigator: { label: "FORENSIC INVESTIGATOR", home: "/investigator/dashboard", links: [{ label: "Workspace", href: "/investigator/dashboard" }, { label: "New investigation", href: "/investigator/investigations/new" }, { label: "Reports", href: "/investigator/reports" }] },
};


export type { Role, User, Doc, Recipient, DecryptionEvent, LedgerBlock, AppState };
export { users, recipients, baseDocs, initialEvents, eventSeed, BLOCK_TIMESTAMPS, BLOCK_EVENTS, placeholderLedger, AppStateContext, useApp, AppStateProvider, roleMeta, sha256hex };
