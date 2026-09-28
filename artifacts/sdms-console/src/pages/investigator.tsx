import { useState, Fragment } from "react";
import { ArrowDown, Check, ScanSearch, Search, X, ArrowRight, FileArchive, Play, FileText, Fingerprint } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useApp, type User } from "../store";
import { Shell, PageHeader, MetricStrip, SectionLabel, DataTable, StatusRow, HashDisplay, Drawer, SearchFilter, IconBox } from "../components/shared";

function InvestigatorDashboard({ user }: { user: User }) {
  return <Shell user={user} section="Attribution workspace"><PageHeader eyebrow="INVESTIGATOR / FORENSIC DESK" title="Attribution workspace" description="Correlate leaked material with recipient-local decryption evidence and signed ledger records." actions={<Link href="/investigator/investigations/new" className="btn-primary flex items-center gap-2"><ScanSearch size={15} /> New investigation</Link>} /><MetricStrip items={[{ label: "Open investigations", value: "01" }, { label: "Matched events", value: "01" }, { label: "Evidence verified", value: "04/04" }, { label: "Reports ready", value: "02" }]} /><div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]"><div className="surface p-5"><SectionLabel right={<span className="font-mono text-[10px] text-[#49a6ae]">INV-20260926-014</span>}>ACTIVE INVESTIGATION</SectionLabel><div className="border border-[#92e6ec] bg-[#f1f8f8] p-5"><div className="eyebrow text-[#0f4c52]">STATUS / MATCHED</div><h2 className="mt-4 font-display text-3xl font-semibold tracking-[-.04em] text-[#0f4c52]">DECRYPTION<br />EVENT MATCHED</h2><div className="mt-6 text-[12px] text-[#587579]">Strategic_Operations_Report_leaked.pdf</div><div className="mt-2 font-mono text-[10px] text-[#0f4c52]">MATCHED TO ANANYA SHARMA / SES-20260926-8F3A</div><Link href="/investigator/investigations/INV-20260926-014" className="btn-secondary mt-6 inline-flex items-center gap-2">Open analysis <ArrowRight size={14} /></Link></div></div><EvidenceChain compact /></div></Shell>;
}
function EvidenceChain({ compact = false }: { compact?: boolean }) {
  const [, setLocation] = useLocation();
  const nodes = [
    {
      label: "DOCUMENT",
      value: "DOC-2026-001",
      key: "document",
      detail: "Strategic Operations Report · SHA-256 9d7c4e…a410",
      status: "ORIGIN VERIFIED",
    },
    {
      label: "RECIPIENT",
      value: "REC-003",
      key: "recipient",
      detail: "Ananya Sharma · PQC identity active",
      status: "AUTHORIZED BINDING",
    },
    {
      label: "SESSION",
      value: "SES-20260926-8F3A",
      key: "session",
      detail: "Recipient-local access session · Nonce bound",
      status: "RECORDED SESSION",
    },
    {
      label: "WATERMARK",
      value: "WM-7F83A2B9",
      key: "watermark",
      detail: "DCT invisible fingerprint · 98.7% match confidence (simulated)",
      status: "MATCHED (SIMULATED)",
    },
    {
      label: "SIGNATURE",
      value: "ML-DSA",
      key: "signature",
      detail: "Recipient-bound digital signature · Prototype profile only",
      status: "PROTOTYPE CHECK",
    },
    {
      label: "LEDGER BLOCK",
      value: "184",
      key: "ledger-block",
      detail: "Tamper-evident chain · SHA-256 block hash verified",
      status: "CHAIN INTACT",
    },
  ];

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between border-b border-[#b7ced0] pb-3 mb-4">
        <SectionLabel>{compact ? "EVIDENCE CHAIN (VERTICAL)" : "FORENSIC EVIDENCE CHAIN (CANONICAL PROVENANCE)"}</SectionLabel>
        <span className="font-mono text-[9px] uppercase tracking-wider text-[#587579]">
          {compact ? "6 NODES" : "CANONICAL VERTICAL ATTRIBUTION"}
        </span>
      </div>

      <div className="flex flex-col items-center">
        {nodes.map((node, index, all) => (
          <div className="flex flex-col items-center w-full" key={node.key}>
            <button
              onClick={() => setLocation(`/investigator/chain/${node.key}`)}
              className="w-full border border-[#92e6ec] bg-[#f1f8f8] p-3 text-left transition-colors hover:bg-[#c6fcff] hover:border-[#49a6ae] focus:outline-none focus:ring-1 focus:ring-[#0f4c52]"
              data-testid={`button-chain-${node.key}`}
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow block text-[#0f4c52] font-semibold">{node.label}</span>
                <span className="font-mono text-[9px] font-bold text-[#0f4c52] bg-[#c6fcff] border border-[#92e6ec] px-1.5 py-0.5">
                  {node.status}
                </span>
              </div>
              <div className="mt-1 font-mono text-[12px] font-semibold text-[#0f4c52]">
                {node.value}
              </div>
              {!compact && (
                <div className="mt-1 text-[11px] text-[#587579] font-mono truncate">
                  {node.detail}
                </div>
              )}
            </button>

            {index < all.length - 1 && (
              <div className="my-1.5 flex flex-col items-center justify-center text-[#49a6ae]">
                <ArrowDown size={compact ? 13 : 15} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[#b7ced0] pt-2.5 flex items-center justify-between font-mono text-[9px] text-[#587579]">
        <span>CLICK ANY NODE TO INSPECT EVIDENCE</span>
        <span>DOCUMENT → LEDGER</span>
      </div>
    </div>
  );
}
function NewInvestigation({ user }: { user: User }) {
  const [, setLocation] = useLocation(); const [step, setStep] = useState(1); const [started, setStarted] = useState(false); const labels = ["EVIDENCE", "EXTRACTION", "CORRELATION", "VERIFICATION", "REPORT"];
  return <Shell user={user} section="New investigation"><PageHeader eyebrow="INVESTIGATOR / CASE INTAKE" title="New forensic investigation" description="Prepare leaked evidence for deterministic watermark and event correlation." /><div className="mb-8 flex items-start overflow-x-auto">{labels.map((label, index) => <div className="flex min-w-[135px] flex-1 items-center" key={label}><div className={`flex items-center gap-2 text-[10px] font-bold tracking-[.1em] ${step >= index + 1 ? "text-[#0f4c52]" : "text-[#587579]"}`}><span className={`flex h-7 w-7 items-center justify-center border font-mono ${step > index ? "border-[#49a6ae] bg-[#c6fcff]" : "border-[#b7ced0]"}`}>{step > index ? <Check size={13} /> : `0${index + 1}`}</span>{label}</div>{index < labels.length - 1 && <div className="mx-3 h-px flex-1 bg-[#92e6ec]" />}</div>)}</div><div className="grid gap-7 lg:grid-cols-[1.15fr_.85fr]"><div className="surface p-6">{step === 1 && <><SectionLabel>01 / UPLOAD LEAKED PDF</SectionLabel><div className="border-2 border-dashed border-[#92e6ec] bg-[#f1f8f8] p-10 text-center"><IconBox><FileArchive size={16} /></IconBox><h2 className="mt-4 font-display text-xl font-semibold text-[#0f4c52]">Strategic_Operations_Report_leaked.pdf</h2><p className="mt-2 font-mono text-[10px] text-[#587579]">4.8 MB · SHA-256 9d7c4e…a410</p></div></>}{step > 1 && <><SectionLabel>{String(step).padStart(2, "0")} / ANALYSIS PREPARATION</SectionLabel><div className="space-y-1 border border-[#b7ced0] bg-[#f1f8f8] p-4"><StatusRow label="Evidence file" value="LOADED" /><StatusRow label="Document metadata" value="EXTRACTED" /><StatusRow label="Correlation target" value="SDMS EVENT REGISTER" /><StatusRow label="Verification path" value="READY" /></div></>}</div><div className="surface p-6"><SectionLabel>CASE MANIFEST</SectionLabel><HashDisplay label="Evidence" value="Strategic_Operations_Report_leaked.pdf" /><div className="mt-3"><HashDisplay label="SHA-256 mock hash" value="9d7c4e…a410" /></div><div className="mt-5 flex justify-between gap-3">{step > 1 ? <button className="btn-quiet" onClick={() => setStep(step - 1)} data-testid="button-investigation-previous">Previous</button> : <span />}{step < 5 ? <button className="btn-primary" onClick={() => setStep(step + 1)} data-testid="button-investigation-continue">Continue <ArrowRight size={14} className="ml-1 inline" /></button> : <button className="btn-primary" onClick={() => { setStarted(true); setLocation("/investigator/investigations/INV-20260926-014"); }} data-testid="button-start-analysis"><ScanSearch size={14} className="mr-1 inline" /> Start analysis</button>}</div>{started && <div className="mt-4 text-[11px] text-[#0f4c52]" role="status">Analysis workspace prepared.</div>}</div></div></Shell>;
}
function AnalysisPage({ user }: { user: User }) {
  const [stage, setStage] = useState(0); const [, setLocation] = useLocation(); const stages = ["DOCUMENT LOADED", "WATERMARK SEARCH", "DCT ANALYSIS", "WATERMARK DETECTED", "EVENT CORRELATION", "SIGNATURE VERIFICATION", "DOCUMENT HASH VERIFICATION", "LEDGER VERIFICATION"];
  const run = () => { if (stage > 0) return; let current = 0; const timer = window.setInterval(() => { current += 1; setStage(current); if (current === stages.length) window.clearInterval(timer); }, 480); };
  return <Shell user={user} section="Forensic analysis" detail="INV-20260926-014"><PageHeader eyebrow="INVESTIGATOR / FORENSIC ANALYSIS" title="Forensic analysis" description="Progressive attribution workbench. Every stage is a deterministic frontend simulation." actions={stage === stages.length ? <button className="btn-secondary" onClick={() => setLocation("/investigator/evidence/INV-20260926-014")} data-testid="button-view-evidence">View evidence <ArrowRight size={14} className="ml-1 inline" /></button> : <button className="btn-primary" onClick={run} disabled={stage > 0} data-testid="button-run-analysis"><Play size={14} className="mr-1 inline" /> {stage ? "Analysis running" : "Launch analysis"}</button>} /><div className="grid min-h-[570px] gap-0 border border-[#b7ced0] lg:grid-cols-[.9fr_1.1fr]"><div className="tech-grid bg-[#07383d] p-6 text-[#eaf4f5]"><SectionLabel>LEAKED DOCUMENT PREVIEW</SectionLabel><div className="relative mt-5 min-h-[400px] border border-[#296b71] bg-[#0f4c52] p-7"><div className="absolute inset-5 border border-[#296b71]" /><div className="relative z-10"><div className="font-mono text-[10px] text-[#92e6ec]">EVIDENCE / INV-20260926-014</div><FileText className="mt-20 text-[#92e6ec]" size={42} /><div className="mt-6 max-w-xs font-display text-3xl font-semibold leading-[1] text-[#c6fcff]">Strategic Operations Report</div><div className="mt-4 font-mono text-[10px] text-[#b9d8da]">LEAKED COPY / HASH 9d7c4e…a410</div></div></div></div><div className="bg-[#eaf4f5] p-6"><SectionLabel right={<span className="font-mono text-[10px] text-[#587579]">{stage}/{stages.length} COMPLETE</span>}>ANALYSIS / PROVENANCE</SectionLabel>{stages.map((item, index) => <div className="flex items-center gap-4 border-b border-[#b7ced0] py-4" key={item}><span className={`flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-[10px] ${stage > index ? "border-[#49a6ae] bg-[#c6fcff] text-[#0f4c52]" : stage === index && stage > 0 ? "border-[#d08a36] text-[#d08a36]" : "border-[#b7ced0] text-[#587579]"}`}>{stage > index ? <Check size={13} /> : `0${index + 1}`}</span><span className="flex-1"><span className="block text-[12px] font-semibold text-[#0f4c52]">{item}</span><span className="font-mono text-[10px] text-[#587579]">{stage > index ? "VERIFIED" : stage === index && stage > 0 ? "PROCESSING…" : "QUEUED"}</span></span>{stage > index && <span className="font-mono text-[9px] text-[#0f4c52]">PASS</span>}</div>)}{stage === stages.length && <div className="mt-5 border border-[#92e6ec] bg-[#c6fcff] p-4 text-[12px] font-semibold text-[#0f4c52]">ANALYSIS COMPLETE / EVENT MATCHED</div>}</div></div></Shell>;
}
function EvidencePage({ user }: { user: User }) {
  const { id = "INV-20260926-014" } = useParams<{ id: string }>();
  return <Shell user={user} section="Evidence / Attribution" detail={id}><PageHeader eyebrow="INVESTIGATOR / EVIDENCE RESULT" title="Evidence / attribution" description="Deterministic chain linking leaked material to recipient-local decryption evidence." /><div className="grid gap-7 lg:grid-cols-[.9fr_1.1fr]"><div className="surface-deep p-7"><div className="eyebrow text-[#92e6ec]">FORENSIC RESULT</div><h2 className="mt-5 font-display text-5xl font-semibold leading-[.92] tracking-[-.05em] text-[#c6fcff]">DECRYPTION<br />EVENT MATCHED</h2><div className="mt-12 border-t border-[#296b71] pt-4 font-mono text-[10px] text-[#92e6ec]">{id} / CONFIDENCE 98.7% (SIMULATED)</div></div><div className="surface p-5"><SectionLabel>VERIFICATION LIST</SectionLabel><StatusRow label="Watermark (DCT)" value="MATCH (SIMULATED)" /><StatusRow label="ML-DSA signature" value="PROTOTYPE CHECK" /><StatusRow label="Document hash" value="MATCH" /><StatusRow label="Ledger chain" value="INTACT" /><div className="mt-6 border-t border-[#b7ced0] pt-5 grid gap-3 sm:grid-cols-2"><HashDisplay label="Recipient" value="Ananya Sharma / REC-003" /><HashDisplay label="Document" value="Strategic Operations Report / DOC-2026-001" /><HashDisplay label="Session" value="SES-20260926-8F3A" /><HashDisplay label="Watermark" value="WM-7F83A2B9 (SIMULATED)" /><HashDisplay label="Event" value="DEC-000184" /><HashDisplay label="Ledger block" value="184" /></div></div></div><div className="mt-7"><EvidenceChain /></div></Shell>;
}
function ChainNodePage({ user }: { user: User }) {
  const { id = "document" } = useParams<{ id: string }>();
  const details: Record<string, [string, string, string]> = {
    document: ["DOCUMENT", "DOC-2026-001", "Strategic Operations Report · SHA-256 9d7c4e…a410"],
    recipient: ["RECIPIENT", "REC-003", "Ananya Sharma · public identity active"],
    session: ["SESSION", "SES-20260926-8F3A", "Recipient-local access session · 26 Sep 2026"],
    watermark: ["WATERMARK", "WM-7F83A2B9", "DCT attribution marker · match confidence 98.7% (simulated)"],
    signature: ["SIGNATURE", "ML-DSA / PROTOTYPE CHECK", "Recipient-bound digital signature profile · simulated check"],
    "ledger-block": ["LEDGER BLOCK", "184", "Private permissioned chain · real SHA-256 block hash (see Admin › Private ledger)"],
  };
  const detail = details[id] ?? details.document;
  return (
    <Shell user={user} section="Evidence chain" detail={detail[0]}>
      <PageHeader
        eyebrow="INVESTIGATOR / TECHNICAL EVIDENCE"
        title={detail[0]}
        description="Interactive technical evidence node from the matched attribution chain."
        actions={
          <Link href="/investigator/evidence/INV-20260926-014" className="btn-quiet">
            Back to evidence
          </Link>
        }
      />
      <div className="surface max-w-3xl p-6">
        <IconBox>
          <Fingerprint size={16} />
        </IconBox>
        <h2 className="mt-5 font-display text-3xl font-semibold text-[#0f4c52]">{detail[1]}</h2>
        <p className="mt-3 text-[13px] leading-6 text-[#587579]">{detail[2]}</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <HashDisplay label="Chain position" value={detail[0]} />
          <HashDisplay label="Verification" value="MATCHED / VERIFIED" />
        </div>
      </div>
    </Shell>
  );
}
function InvestigatorReports({ user }: { user: User }) {
  const [notice, setNotice] = useState("");
  return <Shell user={user} section="Reports"><PageHeader eyebrow="INVESTIGATOR / FORENSIC REPORTS" title="Reports" description="Generated attribution reports available for review and mock export." /><DataTable><div className="grid grid-cols-[1.3fr_1.5fr_.8fr_1fr_.8fr_150px] gap-3 border-b border-[#b7ced0] bg-[#f1f8f8] px-5 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#587579]"><span>Case</span><span>Document</span><span>Match</span><span>Date</span><span>Status</span><span>Action</span></div>{[["INV-20260926-014", "Strategic Operations Report", "REC-003", "26 Sep 2026", "READY"], ["INV-20260918-007", "Infrastructure Security Brief", "REC-004", "18 Sep 2026", "READY"]].map((row) => <div className="data-row grid grid-cols-[1.3fr_1.5fr_.8fr_1fr_.8fr_150px] items-center gap-3 px-5 py-4 text-[11px]" key={row[0]}><span className="font-mono text-[#0f4c52]">{row[0]}</span><span className="font-semibold text-[#0f4c52]">{row[1]}</span><span className="font-mono">{row[2]}</span><span className="text-[#587579]">{row[3]}</span><span className="font-mono text-[#0f4c52]">{row[4]}</span><span className="flex gap-3"><Link href="/investigator/evidence/INV-20260926-014" className="font-mono text-[10px] text-[#0f4c52] underline">VIEW</Link><button onClick={() => setNotice(`${row[0]} mock report export prepared.`)} className="font-mono text-[10px] text-[#0f4c52] underline" data-testid={`button-export-${row[0]}`}>EXPORT</button></span></div>)}</DataTable>{notice && <div className="mt-4 border-l-2 border-[#49a6ae] bg-[#c6fcff] p-4 text-[12px] text-[#0f4c52]" role="status" data-testid="status-report-export">{notice}</div>}</Shell>;
}


export { InvestigatorDashboard, EvidenceChain, NewInvestigation, AnalysisPage, EvidencePage, ChainNodePage, InvestigatorReports };
