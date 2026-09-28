import { useState, useEffect, type ReactNode, type FormEvent } from "react";
import { ArrowRight, Check, ChevronRight, CircleAlert, Copy, LogOut, Search, ShieldCheck, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { type Role, type User, users, roleMeta } from "../store";

function IconBox({ children, tone = "cyan" }: { children: ReactNode; tone?: "cyan" | "dark" | "red" }) {
  return <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center border ${tone === "dark" ? "border-[#296b71] bg-[#07383d] text-[#92e6ec]" : tone === "red" ? "border-[#d89b9b] bg-[#f6dfdf] text-[#8e2929]" : "border-[#92e6ec] bg-[#c6fcff] text-[#0f4c52]"}`}>{children}</span>;
}
function isNavActive(location: string, href: string): boolean {
  if (location === href) return true;
  // Authority:
  if (href === "/authority/distributions/new" && location.startsWith("/authority/distributions")) return true;
  if (href === "/authority/documents" && location.startsWith("/authority/documents")) return true;
  if (href === "/authority/history" && location.startsWith("/authority/history")) return true;
  if (href === "/authority/dashboard" && location === "/authority/dashboard") return true;

  // Recipient:
  if (href === "/recipient/documents" && (location.startsWith("/recipient/documents") || location.startsWith("/recipient/decrypt"))) return true;
  if (href === "/recipient/history" && location.startsWith("/recipient/history")) return true;
  if (href === "/recipient/dashboard" && location === "/recipient/dashboard") return true;

  // Admin:
  if (href === "/admin/events" && location.startsWith("/admin/events")) return true;
  if (href === "/admin/pqc" && location.startsWith("/admin/pqc")) return true;
  if (href === "/admin/ledger" && location.startsWith("/admin/ledger")) return true;
  if (href === "/admin/health" && location.startsWith("/admin/health")) return true;
  if (href === "/admin/dashboard" && location === "/admin/dashboard") return true;

  // Investigator:
  if (href === "/investigator/dashboard" && (location === "/investigator/dashboard" || location.startsWith("/investigator/evidence") || location.startsWith("/investigator/chain"))) return true;
  if (href === "/investigator/investigations/new" && location.startsWith("/investigator/investigations")) return true;
  if (href === "/investigator/reports" && location.startsWith("/investigator/reports")) return true;

  return false;
}

function TopNav({ user }: { user: User }) {
  const [location, setLocation] = useLocation();
  const meta = roleMeta[user.role];
  const logout = () => { localStorage.removeItem("sdms-user"); setLocation("/login"); };
  return <header className="topnav">
    <div className="topnav-inner">
      <Link href={meta.home} className="flex shrink-0 items-center gap-3" data-testid="link-brand">
        <span className="flex h-8 w-8 items-center justify-center border border-[#92e6ec] bg-[#07383d] text-[#c6fcff]">
          <ShieldCheck size={18} />
        </span>
        <span>
          <span className="font-display text-[17px] font-bold tracking-[-.03em] text-[#eaf4f5]">SDMS</span>
          <span className="ml-2.5 hidden text-[9px] uppercase tracking-[.15em] text-[#b9d8da] lg:inline">Secure Document Management System</span>
        </span>
      </Link>
      <div className="hidden h-7 w-px bg-[#296b71] xl:block" />
      <nav className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto">{meta.links.map((link) => <Link key={link.href} href={link.href} className={`topnav-link ${isNavActive(location, link.href) ? "active" : ""}`} data-testid={`link-nav-${link.label.toLowerCase().replaceAll(" ", "-")}`}>{link.label}</Link>)}</nav>
      <div className="hidden items-center gap-2 border-l border-[#296b71] pl-4 lg:flex"><span className="h-2 w-2 bg-[#92e6ec]" /><span className="font-mono text-[9px] tracking-[.12em] text-[#c6fcff]">AIR-GAPPED / OPERATIONAL</span></div>
      <div className="hidden items-center gap-2 border-l border-[#296b71] pl-4 sm:flex"><span className="flex h-7 w-7 items-center justify-center bg-[#c6fcff] text-[10px] font-bold text-[#0f4c52]">{user.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span><span className="hidden xl:block"><span className="block text-[10px] font-semibold text-[#eaf4f5]">{user.name}</span><span className="font-mono text-[8px] text-[#92e6ec]">{meta.label}</span></span></div>
      <button onClick={logout} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.08em] text-[#b9d8da] hover:text-[#c6fcff]" data-testid="button-logout"><LogOut size={14} /> <span className="hidden md:inline">Logout</span></button>
    </div>
  </header>;
}
function ContextBar({ role, section, detail }: { role: Role; section: string; detail?: string }) {
  return <div className="border-b border-[#b7ced0] bg-[#eaf4f5]"><div className="mx-auto flex max-w-[1480px] items-center justify-between px-[clamp(16px,4vw,58px)] py-2.5"><div className="flex min-w-0 items-center gap-2 text-[10px] uppercase tracking-[.12em] text-[#587579]"><span className="font-mono text-[#0f4c52]">SDMS</span><ChevronRight size={12} /><span className="font-mono text-[#0f4c52]">{roleMeta[role].label}</span><ChevronRight size={12} /><span className="truncate">{section}</span>{detail && <><ChevronRight size={12} /><span className="truncate text-[#0f4c52]">{detail}</span></>}</div><div className="hidden gap-4 font-mono text-[9px] text-[#587579] sm:flex"><span>ENV / SIMULATION</span><span>UTC+05:30</span></div></div></div>;
}
function Shell({ user, section, detail, children }: { user: User; section: string; detail?: string; children: ReactNode }) {
  return <div className="sdms-shell"><TopNav user={user} /><ContextBar role={user.role} section={section} detail={detail} /><main className="sdms-main">{children}</main></div>;
}
function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-5 border-b border-[#b7ced0] pb-6 md:flex-row md:items-end"><div><div className="eyebrow mb-3">{eyebrow}</div><h1 className="title-display" data-testid={`title-${title.toLowerCase().replaceAll(" ", "-")}`}>{title}</h1>{description && <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[#587579]">{description}</p>}</div>{actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}</div>;
}
function MetricStrip({ items }: { items: { label: string; value: string; note?: string }[] }) {
  return <div className="metric-strip mb-7">{items.map((item) => <div className="metric-cell" key={item.label}><div className="eyebrow">{item.label}</div><div className="metric-value" data-testid={`metric-${item.label.toLowerCase().replaceAll(" ", "-")}`}>{item.value}</div>{item.note && <div className="mt-2 text-[11px] text-[#587579]">{item.note}</div>}</div>)}</div>;
}
function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return <div className="mb-3 flex items-center justify-between"><span className="eyebrow">{children}</span>{right}</div>;
}
function StatusRow({ label, value, state = "verified", detail }: { label: string; value: string; state?: "verified" | "pending" | "failure"; detail?: string }) {
  return <div className="flex items-center gap-3 border-b border-[#b7ced0] py-3"><span className={`h-2 w-2 shrink-0 ${state === "failure" ? "bg-[#a83d3d]" : state === "pending" ? "bg-[#d08a36]" : "bg-[#49a6ae]"}`} /><span className="min-w-0 flex-1"><span className="block text-[12px] font-semibold uppercase tracking-[.04em] text-[#102f33]">{label}</span>{detail && <span className="mt-0.5 block text-[11px] text-[#587579]">{detail}</span>}</span><span className={`font-mono text-[11px] ${state === "failure" ? "text-[#8e2929]" : "text-[#0f4c52]"}`}>{value}</span></div>;
}
function HashDisplay({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 900); }} className="group flex w-full items-center justify-between gap-3 border border-[#b7ced0] bg-[#f1f8f8] px-3 py-2 text-left" data-testid={`button-copy-${label.toLowerCase().replaceAll(" ", "-")}`}><span><span className="eyebrow block mb-1">{label}</span><span className="font-mono text-[11px] text-[#0f4c52]">{value}</span></span>{copied ? <span className="font-mono text-[9px] text-[#0f4c52]">COPIED</span> : <Copy size={14} className="text-[#587579]" />}</button>;
}
function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <><div className="scrim" onClick={onClose} /><aside className="drawer" aria-label={title}><div className="flex items-start justify-between border-b border-[#b7ced0] p-5"><div><div className="eyebrow mb-2">TECHNICAL RECORD</div><h2 className="font-display text-2xl font-semibold text-[#0f4c52]">{title}</h2></div><button onClick={onClose} className="btn-quiet !px-2 !py-2" aria-label="Close detail drawer" data-testid="button-close-drawer"><X size={16} /></button></div><div className="p-5">{children}</div></aside></>;
}
function DataTable({ children }: { children: ReactNode }) { return <div className="surface overflow-x-auto"><div className="min-w-[720px]">{children}</div></div>; }
function SearchFilter({ value, onChange, placeholder = "Search records" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="relative block min-w-[220px]"><Search size={14} className="absolute left-3 top-3 text-[#587579]" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full border border-[#b7ced0] bg-[#f1f8f8] py-2.5 pl-9 pr-3 text-[12px] text-[#0f4c52]" data-testid="input-search" /></label>;
}
function Guard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useSession();
  if (!user) return <Login />;
  if (!roles.includes(user.role)) return <Shell user={user} section="Access denied"><PageHeader eyebrow="SDMS / ACCESS CONTROL" title="Workspace unavailable" description="This role does not have access to the requested operational surface." /><div className="surface p-6"><StatusRow label="Current identity" value={roleMeta[user.role].label} /><Link className="btn-primary mt-5 inline-flex" href={roleMeta[user.role].home}>Return to workspace</Link></div></Shell>;
  return <>{children}</>;
}
function useSession() {
  const [user, setUser] = useState<User | null>(() => { try { const saved = localStorage.getItem("sdms-user"); return saved ? JSON.parse(saved) as User : null; } catch { return null; } });
  const login = (next: User) => { localStorage.setItem("sdms-user", JSON.stringify(next)); setUser(next); };
  const logout = () => { localStorage.removeItem("sdms-user"); setUser(null); };
  return { user, login, logout };
}

function Login({ preset }: { preset?: string }) {
  const [, setLocation] = useLocation();
  const session = useSession();
  const [username, setUsername] = useState(preset ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { if (preset) setUsername(preset); }, [preset]);
  const submit = (event: FormEvent) => { event.preventDefault(); const match = users.find((candidate) => candidate.username === username.trim().toLowerCase() && password === "demo"); if (!match) { setError("Credential pair not recognized. Use a listed demo identity with password demo."); return; } session.login(match); setLocation(roleMeta[match.role].home); };
  return <div className="flex min-h-[100dvh] items-center justify-center bg-[#dce8e9] px-4 py-10"><div className="grid w-full max-w-[1040px] border border-[#b7ced0] bg-[#eaf4f5] md:grid-cols-[.9fr_1.1fr]"><div className="tech-grid flex min-h-[270px] flex-col justify-between bg-[#07383d] p-7 text-[#eaf4f5] md:p-10"><div><div className="flex items-center gap-3"><IconBox tone="dark"><ShieldCheck size={18} /></IconBox><span className="font-display text-2xl font-bold tracking-[-.04em] text-[#eaf4f5]">SDMS</span></div><div className="mt-16 max-w-sm"><div className="eyebrow text-[#92e6ec]">SECURE DOCUMENT MANAGEMENT SYSTEM</div><h1 className="mt-4 font-display text-4xl font-semibold leading-[.98] tracking-[-.05em] text-[#c6fcff]">Controlled movement.<br />Accountable access.</h1><p className="mt-5 text-[12px] leading-6 text-[#b9d8da]">A deterministic air-gapped operations console for document release, recipient access, and forensic attribution.</p></div></div><div className="font-mono text-[10px] text-[#92e6ec]">AIR-GAPPED ENVIRONMENT / LOCAL PROTOTYPE</div></div><div className="p-7 md:p-10"><div className="eyebrow mb-3">IDENTITY GATEWAY</div><h2 className="font-display text-3xl font-semibold tracking-[-.04em] text-[#0f4c52]">Sign in to SDMS</h2><p className="mt-2 text-[12px] text-[#587579]">Use a demo identity to enter its role-specific workspace.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block"><span className="eyebrow mb-2 block">USERNAME</span><input autoFocus value={username} onChange={(event) => setUsername(event.target.value)} className="w-full border border-[#b7ced0] bg-[#f1f8f8] px-3 py-3 text-[13px] text-[#0f4c52]" placeholder="authority" data-testid="input-username" /></label><label className="block"><span className="eyebrow mb-2 block">PASSWORD</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-[#b7ced0] bg-[#f1f8f8] px-3 py-3 text-[13px] text-[#0f4c52]" placeholder="demo" data-testid="input-password" /></label>{error && <div className="border-l-2 border-[#a83d3d] bg-[#f6dfdf] p-3 text-[12px] text-[#8e2929]" role="alert" data-testid="status-login-error"><CircleAlert size={14} className="mr-2 inline" />{error}</div>}<button className="btn-primary flex w-full items-center justify-center gap-2 py-3" type="submit" data-testid="button-login">Enter workspace <ArrowRight size={15} /></button></form><div className="mt-8 border-t border-[#b7ced0] pt-5"><div className="eyebrow mb-3">AVAILABLE DEMO IDENTITIES / PASSWORD: DEMO</div><div className="grid grid-cols-2 gap-2 text-[11px]">{users.map((candidate) => <button type="button" key={candidate.username} onClick={() => { setUsername(candidate.username); setPassword("demo"); setError(""); }} className="border border-[#b7ced0] bg-[#f1f8f8] px-3 py-2 text-left text-[#0f4c52] hover:border-[#49a6ae]" data-testid={`button-demo-${candidate.username}`}><span className="block font-semibold">{candidate.name}</span><span className="font-mono text-[9px] text-[#587579]">{candidate.username} / {candidate.role}</span></button>)}</div></div></div></div></div>;
}


export { IconBox, isNavActive, TopNav, ContextBar, Shell, PageHeader, MetricStrip, SectionLabel, StatusRow, HashDisplay, Drawer, DataTable, SearchFilter, Guard, useSession, Login };
