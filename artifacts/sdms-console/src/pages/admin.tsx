import { useState } from "react";
import { ClipboardCheck, Fingerprint, Search, X, Check, LockKeyhole, RotateCcw, ShieldCheck, CircleAlert } from "lucide-react";
import { Link } from "wouter";
import { useApp, type User, type DecryptionEvent, type LedgerBlock, baseDocs, recipients, sha256hex } from "../store";
import { Shell, PageHeader, MetricStrip, SectionLabel, DataTable, StatusRow, HashDisplay, Drawer, SearchFilter, IconBox } from "../components/shared";

function AdminDashboard({ user }: { user: User }) {
  const [selected, setSelected] = useState<DecryptionEvent | null>(null); const { events, tampered } = useApp();
  return <Shell user={user} section="Operations"><PageHeader eyebrow="ADMIN / SECURITY OPERATIONS" title="Security operations" description="Technical view of recipient decryption, identity readiness, and private ledger continuity." actions={<Link href="/admin/events" className="btn-primary flex items-center gap-2"><ClipboardCheck size={15} /> Review events</Link>} /><MetricStrip items={[{ label: "Decryption events", value: "184" }, { label: "Active recipient identities", value: "03" }, { label: "Ledger blocks", value: "185" }, { label: "PQC status", value: "OPERATIONAL" }]} /><div className="grid gap-7 lg:grid-cols-[1.4fr_.6fr]"><div><SectionLabel>RECENT DECRYPTION EVENTS</SectionLabel><DataTable><div className="grid grid-cols-[1fr_1.3fr_.7fr_1.3fr_.9fr_100px] gap-3 border-b border-[#b7ced0] bg-[#f1f8f8] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#587579]"><span>Event</span><span>Document</span><span>Recipient</span><span>Session</span><span>Timestamp</span><span>State</span></div>{events.slice(0, 4).map((event) => <button className="data-row grid w-full grid-cols-[1fr_1.3fr_.7fr_1.3fr_.9fr_100px] gap-3 px-4 py-4 text-left text-[10px] hover:bg-[#f1f8f8]" onClick={() => setSelected(event)} key={event.id} data-testid={`row-event-${event.id}`}><span className="font-mono text-[#0f4c52]">{event.id}</span><span className="text-[#0f4c52]">Strategic Operations Report</span><span className="font-mono text-[#0f4c52]">{event.recipient}</span><span className="font-mono text-[#587579]">{event.session}</span><span className="text-[#587579]">{event.timestamp}</span><span className="font-mono text-[#0f4c52]">{event.state}</span></button>)}</DataTable></div><div className="surface p-5"><SectionLabel>NODE OBSERVATIONS</SectionLabel><StatusRow label="Private ledger chain" value={tampered ? "MISMATCH" : "INTACT"} state={tampered ? "failure" : "verified"} detail="Block 184 / 185 continuity" /><StatusRow label="PQC identity service" value="ONLINE" detail="ML-KEM + ML-DSA profiles" /><StatusRow label="Air-gapped relay" value="SEALED" detail="No external egress" /><StatusRow label="Audit recorder" value="RECORDING" detail="Last event DEC-000184" /></div></div>{selected && <EventDrawer event={selected} onClose={() => setSelected(null)} />}</Shell>;
}
function EventDrawer({ event, onClose }: { event: DecryptionEvent; onClose: () => void }) {
  const doc = baseDocs.find((d) => d.id === event.document);
  const rec = recipients.find((r) => r.id === event.recipient);
  return (
    <Drawer title={`EVENT ${event.id}`} onClose={onClose}>
      <div className="space-y-5">
        <div className="border border-[#b7ced0] bg-[#f1f8f8] p-4">
          <div className="eyebrow mb-1">PROVENANCE BINDING</div>
          <div className="font-display text-lg font-bold text-[#0f4c52]">{doc?.title ?? event.document}</div>
          <div className="mt-1 font-mono text-[10px] text-[#587579]">{event.document} · {rec?.name ?? event.recipient} ({event.recipient})</div>
        </div>

        <div>
          <div className="eyebrow mb-2">CHAIN ATTRIBUTION METRICS</div>
          <div className="space-y-1">
            <HashDisplay label="EVENT ID" value={event.id} />
            <HashDisplay label="DOCUMENT HASH (SHA-256)" value="9d7c4ea08b31a89f…a410" />
            <HashDisplay label="RECIPIENT IDENTITY" value={`${event.recipient} / ${rec?.name ?? "Authorized Recipient"}`} />
            <HashDisplay label="SESSION NONCE" value={event.session} />
            <HashDisplay label="WATERMARK FINGERPRINT" value={event.watermark} />
            <HashDisplay label="RECIPIENT SIGNATURE" value="ML-DSA / VERIFIED (SIMULATED)" />
            <HashDisplay label="COMMITTED LEDGER BLOCK" value={`BLOCK ${event.block}`} />
            <HashDisplay label="TIMESTAMP" value={event.timestamp} />
          </div>
        </div>

        <div className="border-t border-[#b7ced0] pt-4">
          <div className="eyebrow mb-2">CRYPTOGRAPHIC POSTURE</div>
          <StatusRow label="Watermark embedding" value="DCT FREQUENCY" detail="Session-bound invisible fingerprint" />
          <StatusRow label="Signature scheme" value="ML-DSA" detail="Post-quantum digital signature" />
          <StatusRow label="Ledger record" value={`BLOCK ${event.block}`} detail="Tamper-evident hash chained" />
          <StatusRow label="Verification status" value={event.state} state={event.state === "VERIFIED" ? "verified" : "pending"} detail="Air-gapped verification status" />
        </div>
      </div>
    </Drawer>
  );
}

function AdminEvents({ user }: { user: User }) {
  const { events } = useApp();
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [selected, setSelected] = useState<DecryptionEvent | null>(null);

  const filtered = events.filter((event) => {
    const doc = baseDocs.find((d) => d.id === event.document);
    const searchTarget = `${event.id} ${event.session} ${event.watermark} ${event.document} ${doc?.title ?? ""}`.toLowerCase();
    const matchesQuery = searchTarget.includes(query.toLowerCase());
    const matchesRecipient = recipient === "ALL" || event.recipient === recipient;
    const matchesState = stateFilter === "ALL" || event.state === stateFilter;
    return matchesQuery && matchesRecipient && matchesState;
  });

  const verifiedCount = events.filter((e) => e.state === "VERIFIED").length;
  const recordedCount = events.filter((e) => e.state === "RECORDED").length;

  return (
    <Shell user={user} section="Decryption events">
      <PageHeader
        eyebrow="SECURITY OPERATIONS / DECRYPTION AUDIT"
        title="Decryption events"
        description="Comprehensive technical register of recipient-side decryption sessions, session watermarks, and committed ledger proofs."
      />

      <MetricStrip
        items={[
          { label: "Total recorded events", value: String(events.length).padStart(2, "0"), note: "Audit events logged" },
          { label: "Verified records", value: String(verifiedCount).padStart(2, "0"), note: "Prototype signature & ledger checks passed" },
          { label: "Pending audit check", value: String(recordedCount).padStart(2, "0"), note: "Awaiting administrator review" },
          { label: "Active recipient bindings", value: String(recipients.length).padStart(2, "0"), note: "PQC key pairs registered" },
        ]}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchFilter value={query} onChange={setQuery} placeholder="Search event, session, watermark, doc" />
          <select
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            className="border border-[#b7ced0] bg-[#f1f8f8] px-3 py-2.5 text-[11px] font-mono text-[#0f4c52]"
            data-testid="select-event-recipient"
          >
            <option value="ALL">ALL RECIPIENTS</option>
            {recipients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} ({item.name})
              </option>
            ))}
          </select>
          <select
            value={stateFilter}
            onChange={(event) => setStateFilter(event.target.value)}
            className="border border-[#b7ced0] bg-[#f1f8f8] px-3 py-2.5 text-[11px] font-mono text-[#0f4c52]"
            data-testid="select-event-state"
          >
            <option value="ALL">ALL STATES</option>
            <option value="RECORDED">RECORDED</option>
            <option value="VERIFIED">VERIFIED</option>
          </select>
        </div>
        <div className="font-mono text-[11px] text-[#587579]">
          SHOWING <span className="font-bold text-[#0f4c52]">{filtered.length}</span> OF {events.length} EVENTS
        </div>
      </div>

      <DataTable>
        <div className="grid grid-cols-[100px_1.5fr_100px_130px_120px_90px_130px_100px] gap-3 border-b border-[#b7ced0] bg-[#f1f8f8] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#587579]">
          <span>Event ID</span>
          <span>Document</span>
          <span>Recipient</span>
          <span>Session Nonce</span>
          <span>Watermark ID</span>
          <span>Block</span>
          <span>Timestamp</span>
          <span>Status</span>
        </div>
        {filtered.map((event) => {
          const doc = baseDocs.find((d) => d.id === event.document);
          const rec = recipients.find((r) => r.id === event.recipient);
          return (
            <button
              className="data-row grid w-full grid-cols-[100px_1.5fr_100px_130px_120px_90px_130px_100px] items-center gap-3 px-4 py-3.5 text-left text-[11px] hover:bg-[#f1f8f8]"
              onClick={() => setSelected(event)}
              key={event.id}
              data-testid={`button-event-${event.id}`}
            >
              <span className="font-mono font-bold text-[#0f4c52]">{event.id}</span>
              <span className="truncate">
                <span className="block truncate font-semibold text-[#0f4c52]">{doc?.title ?? event.document}</span>
                <span className="font-mono text-[9px] text-[#587579]">{event.document}</span>
              </span>
              <span className="font-mono text-[#0f4c52]">
                <span className="block font-semibold">{event.recipient}</span>
                <span className="text-[9px] text-[#587579] truncate">{rec?.name.split(" ")[0]}</span>
              </span>
              <span className="font-mono text-[10px] text-[#587579]">{event.session}</span>
              <span className="font-mono text-[10px] font-semibold text-[#0f4c52]">{event.watermark}</span>
              <span className="font-mono text-[#0f4c52]">#{event.block}</span>
              <span className="font-mono text-[10px] text-[#587579]">{event.timestamp}</span>
              <span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold tracking-wider font-mono border ${
                    event.state === "VERIFIED"
                      ? "border-[#49a6ae] bg-[#c6fcff] text-[#0f4c52]"
                      : "border-[#b7ced0] bg-[#eaf4f5] text-[#587579]"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 ${event.state === "VERIFIED" ? "bg-[#0f4c52]" : "bg-[#d08a36]"}`} />
                  {event.state}
                </span>
              </span>
            </button>
          );
        })}
        {!filtered.length && (
          <div className="p-10 text-center text-[12px] text-[#587579]">
            No decryption events match the specified search query or filters.
          </div>
        )}
      </DataTable>

      {selected && <EventDrawer event={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
}
function AdminPqc({ user }: { user: User }) {
  return <Shell user={user} section="PQC / Identity"><PageHeader eyebrow="ADMIN / IDENTITY SERVICES" title="PQC / identity" description="Recipient public identity readiness for simulated post-quantum release operations. Private keys are never exposed." /><div className="grid gap-5 lg:grid-cols-3">{recipients.map((recipient) => <div className="surface p-5" key={recipient.id}><div className="flex items-center gap-3 border-b border-[#b7ced0] pb-4"><IconBox><Fingerprint size={16} /></IconBox><div><div className="font-semibold text-[#0f4c52]">{recipient.name}</div><div className="font-mono text-[10px] text-[#587579]">{recipient.id}</div></div></div><StatusRow label="ML-KEM" value="AVAILABLE" detail="Key establishment / encapsulation" /><StatusRow label="ML-DSA" value="AVAILABLE" detail="Digital signature verification" /><StatusRow label="Identity" value="ACTIVE" detail="Public profile registered" /><div className="mt-5 border-t border-[#b7ced0] pt-4 text-[11px] leading-5 text-[#587579]">This console shows public identity availability only. Private key material is held outside the interface.</div></div>)}</div><div className="mt-7 surface p-5"><SectionLabel>PROFILE EXPLANATION</SectionLabel><div className="grid gap-4 md:grid-cols-3"><StatusRow label="ML-KEM" value="KEY ESTABLISHMENT" detail="Recipient-bound encapsulation profile" /><StatusRow label="ML-DSA" value="SIGNATURE" detail="Digital signature profile" /><StatusRow label="SHA-256" value="HASHING" detail="Document and event hashing" /></div></div></Shell>;
}
function AdminLedger({ user }: { user: User }) {
  const { ledger, ledgerReady, tampered, setTampered } = useApp();
  const [selected, setSelected] = useState<LedgerBlock | null>(null);
  const [notice, setNotice] = useState("");

  // Verify chain integrity by recomputing hashes from stored ledger values.
  const verify = async () => {
    if (!ledgerReady) { setNotice("Ledger hashes are still being computed. Please try again."); return; }
    if (tampered) { setNotice("Chain verification FAILED. Block 184 event-hash mismatch detected. Block 185 previous-hash mismatch. Chain is broken."); return; }
    // Re-derive each block's current hash and compare.
    let intact = true;
    for (let i = 0; i < ledger.length; i++) {
      const b = ledger[i];
      const recomputed = await sha256hex(`${b.previous}:${b.eventHash}:${b.timestamp}`);
      if (recomputed !== b.current) { intact = false; break; }
    }
    setNotice(intact
      ? "Chain verification PASSED. All 5 blocks (181–185) are internally consistent. Real SHA-256 chain intact."
      : "Verification found hash discrepancies. Chain integrity compromised.");
  };

  // Truncate long hash for display in table (show first 8 + … + last 8 chars).
  const shortHash = (h: string) => h === "computing…" ? h : (h.length > 20 ? `${h.slice(0, 8)}…${h.slice(-8)}` : h);

  return (
    <Shell user={user} section="Private ledger">
      <PageHeader
        eyebrow="ADMIN / PERMISSIONED CHAIN"
        title="Private ledger"
        description="Prototype tamper-evident local event chain. Hashes are real SHA-256 values computed by the browser Web Crypto API. This is not a production distributed ledger."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary flex items-center gap-2" onClick={verify} data-testid="button-verify-ledger">
              <ShieldCheck size={14} /> Verify ledger
            </button>
            <button className="btn-danger flex items-center gap-2" onClick={() => { setTampered(true); setNotice(""); }} data-testid="button-simulate-tamper">
              <CircleAlert size={14} /> Simulate tamper
            </button>
            <button className="btn-quiet flex items-center gap-2" onClick={() => { setTampered(false); setNotice(""); }} data-testid="button-restore-ledger">
              <RotateCcw size={14} /> Restore test state
            </button>
          </div>
        }
      />

      {/* Prototype label */}
      <div className="mb-5 flex items-center gap-3 border border-[#b7ced0] bg-[#f1f8f8] px-4 py-3">
        <span className="h-2 w-2 shrink-0 bg-[#d08a36]" />
        <span className="font-mono text-[10px] text-[#587579]">
          PROTOTYPE / SIMULATED LEDGER — Real SHA-256 hash chain (Web Crypto API) · Private/local · Not a public blockchain · Air-gapped operation
        </span>
        <span className={`ml-auto font-mono text-[10px] font-semibold ${ledgerReady ? "text-[#0f4c52]" : "text-[#d08a36]"}`}>
          {ledgerReady ? "HASHES READY" : "COMPUTING…"}
        </span>
      </div>

      {notice && (
        <div
          className={`mb-5 border-l-2 p-4 text-[12px] ${
            notice.includes("FAILED") || notice.includes("compromised")
              ? "border-[#a83d3d] bg-[#f6dfdf] text-[#8e2929]"
              : "border-[#49a6ae] bg-[#c6fcff] text-[#0f4c52]"
          }`}
          role="status"
          data-testid="status-ledger"
        >
          {notice}
        </div>
      )}

      {tampered && (
        <div className="mb-5 border-l-2 border-[#a83d3d] bg-[#f6dfdf] p-4 text-[12px] text-[#8e2929]" role="alert">
          TAMPER SIMULATION ACTIVE — Block 184 event-hash and block 185 previous-hash are shown as mismatched. Run "Verify ledger" to see chain failure.
        </div>
      )}

      <DataTable>
        <div className="grid grid-cols-[.45fr_.9fr_1.4fr_1.4fr_1.4fr_.95fr] gap-3 border-b border-[#b7ced0] bg-[#f1f8f8] px-4 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#587579]">
          <span>Block</span>
          <span>Event</span>
          <span>Previous hash (SHA-256)</span>
          <span>Event hash (SHA-256)</span>
          <span>Block hash (SHA-256)</span>
          <span>Timestamp</span>
        </div>
        {ledger.map((block) => (
          <button
            className={`data-row grid w-full grid-cols-[.45fr_.9fr_1.4fr_1.4fr_1.4fr_.95fr] gap-3 px-4 py-4 text-left text-[10px] hover:bg-[#f1f8f8] ${
              tampered && block.block >= 184 ? "border-l-2 border-[#a83d3d]" : ""
            }`}
            onClick={() => setSelected(block)}
            key={block.block}
            data-testid={`button-block-${block.block}`}
          >
            <span className="font-mono font-bold text-[#0f4c52]">{block.block}</span>
            <span className="font-mono text-[#0f4c52]">{block.event}</span>
            <span className={`font-mono ${tampered && block.block === 185 ? "text-[#8e2929] font-bold" : "text-[#587579]"}`}>
              {tampered && block.block === 185 ? "mismatch…" : shortHash(block.previous)}
            </span>
            <span className={`font-mono ${tampered && block.block === 184 ? "text-[#8e2929] font-bold" : "text-[#587579]"}`}>
              {tampered && block.block === 184 ? "mismatch…" : shortHash(block.eventHash)}
            </span>
            <span className="font-mono text-[#0f4c52]">{shortHash(block.current)}</span>
            <span className="text-[#587579]">{block.timestamp}</span>
          </button>
        ))}
      </DataTable>

      {selected && (
        <Drawer title={`LEDGER BLOCK ${selected.block}`} onClose={() => setSelected(null)}>
          <div className="space-y-5">
            <div className="border border-[#b7ced0] bg-[#f1f8f8] p-4">
              <div className="eyebrow mb-1">PROTOTYPE LEDGER RECORD</div>
              <div className="font-mono text-[10px] text-[#587579]">
                Real SHA-256 hash chain · Web Crypto API · Local simulation only
              </div>
            </div>
            <StatusRow label="Event" value={selected.event} />
            <HashDisplay label="Previous hash (SHA-256)" value={selected.previous} />
            <HashDisplay label="Event hash (SHA-256)" value={selected.eventHash} />
            <HashDisplay label="Block hash (SHA-256)" value={selected.current} />
            <StatusRow label="Signature" value="ML-DSA / SIMULATED" detail="Post-quantum signature — prototype only" />
            <StatusRow
              label="Chain status"
              value={tampered && selected.block >= 184 ? "MISMATCH (SIMULATED)" : "INTACT"}
              state={tampered && selected.block >= 184 ? "failure" : "verified"}
              detail={tampered && selected.block >= 184 ? "Tamper simulation active" : "Hash chain consistent"}
            />
          </div>
        </Drawer>
      )}
    </Shell>
  );
}
function AdminHealth({ user }: { user: User }) {
  return <Shell user={user} section="System health"><PageHeader eyebrow="ADMIN / NODE STATUS" title="System health" description="Structured technical status for the air-gapped SDMS simulation." /><div className="surface"><div className="grid grid-cols-[1.4fr_1fr_1.5fr] border-b border-[#b7ced0] bg-[#f1f8f8] px-5 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-[#587579]"><span>Service</span><span>State</span><span>Observation</span></div>{[["AIR-GAPPED NETWORK", "OPERATIONAL", "Private relay sealed / no external egress"], ["PQC ENGINE", "AVAILABLE", "ML-KEM and ML-DSA profiles loaded"], ["PRIVATE LEDGER", "OPERATIONAL", "185 blocks / local event chain"], ["LOCAL STORAGE", "AVAILABLE", "Encrypted simulation workspace"], ["DATABASE", "OPERATIONAL", "Deterministic mock service abstraction"], ["WATERMARK ENGINE", "AVAILABLE", "DCT analysis simulation ready"]].map((row) => <div className="data-row grid grid-cols-[1.4fr_1fr_1.5fr] px-5 py-4 text-[12px]" key={row[0]}><span className="font-semibold text-[#0f4c52]">{row[0]}</span><span className="font-mono text-[#0f4c52]">{row[1]}</span><span className="text-[#587579]">{row[2]}</span></div>)}</div></Shell>;
}


export { AdminDashboard, EventDrawer, AdminEvents, AdminPqc, AdminLedger, AdminHealth };
