# SDMS — PROJECT CONTEXT & IMPLEMENTATION SPECIFICATION

**Project:** Secure Document Management System (SDMS)  
**SIH:** Smart India Hackathon 2026  
**Problem Statement:** 26237  
**Domain:** Ministry of Defence / Indian Navy / WESEE  
**Type:** Software  
**Primary areas:** Cybersecurity, cryptography, blockchain / distributed-ledger concepts

This is the master product and implementation context for AI coding agents working on this repository.

`AGENTS.md` defines how an AI must work. This document defines what the system is, why it exists, what must be built, what is currently implemented, and what must not be changed without an explicit architectural decision.

---

# 1. PRODUCT PURPOSE

SDMS is a secure document distribution and forensic attribution system for sensitive documents distributed to multiple authorized recipients.

The central problem is that when multiple recipients receive the same decrypted content, a leaked copy cannot easily be associated with the exact recipient/decryption event that produced it.

SDMS addresses this by creating a recipient- and session-specific invisible forensic watermark at decryption time and cryptographically binding the decryption event to the recipient. The resulting evidence is committed to a private tamper-evident ledger.

If a leaked copy is later recovered, an investigator can extract the watermark, correlate it with the recorded decryption event, verify the cryptographic evidence, verify ledger integrity, and establish the recipient associated with that recorded decryption event.

# 2. CORE OBJECTIVE

**DISTRIBUTE → DECRYPT → WATERMARK → SIGN → DLT → LEAK → EXTRACT → MATCH → VERIFY → ATTRIBUTE**

Every major product decision should support this story.

# 3. WHAT SDMS IS

SDMS is primarily:
- a cryptographic document-provenance platform
- a forensic attribution platform
- a recipient-specific decryption-event recording system
- an immutable/tamper-evident evidence system
- an offline-capable secure operations platform

# 4. WHAT SDMS IS NOT

SDMS is NOT primarily:
- a Google Drive/Dropbox replacement
- a normal file-sharing application
- a public blockchain application
- a cloud KMS system
- an internet-dependent verification service
- a system that guarantees leakage cannot happen
- a system that automatically proves malicious intent
- a system that automatically proves guilt

The objective is **forensic attribution and verifiable provenance after a leak**, not absolute leak prevention.

# 5. SIH OBJECTIVE → TECHNICAL CAPABILITIES

The implementation should demonstrate:
1. Secure encrypted document distribution.
2. Recipient-specific key protection.
3. Local/recipient-side decryption.
4. Session-specific invisible forensic watermark generation.
5. Cryptographic binding of the decryption event to the recipient.
6. Digital signature of the event.
7. Immutable/tamper-evident recording of the signed event.
8. Offline/air-gapped capability.
9. Forensic watermark extraction from a leaked copy.
10. Correlation of the watermark to the recorded event.
11. Digital-signature verification.
12. Document-hash verification.
13. Ledger-integrity verification.
14. A clear evidence chain for an investigator.

# 6. END-TO-END TARGET WORKFLOW

## Phase A — Distribution

Document Authority:
1. Select/upload a sensitive PDF.
2. Calculate the document hash.
3. Encrypt the document using AES-256-GCM.
4. Protect the document key for each authorized recipient using ML-KEM.
5. Create the distribution record.
6. Distribute the encrypted package through the approved local/offline environment.

The backend should not need access to plaintext as part of the intended architecture.

## Phase B — Recipient Decryption

Recipient:
1. Authenticates.
2. Retrieves the encrypted document/package.
3. Performs ML-KEM decapsulation locally.
4. Recovers the AES document key.
5. Performs AES-256-GCM decryption locally.
6. Creates a new decryption session.
7. Generates a unique session-specific watermark.
8. Embeds the watermark invisibly into the decrypted document.
9. Creates the decryption event.
10. Signs the event using the recipient's ML-DSA private key.
11. Commits the signed evidence to the private ledger.
12. Releases the visually usable protected copy to the recipient.

The recipient's private key must never be placed into the ledger.

## Phase C — Leakage

A recipient may still share or leak a decrypted copy. SDMS does not claim to make such sharing impossible. The watermark makes the resulting copy forensically attributable to a recorded decryption event.

## Phase D — Investigation

Forensic Investigator:
1. Creates an investigation.
2. Uploads/ingests the leaked PDF.
3. Renders/analyzes the document as needed.
4. Extracts the invisible watermark.
5. Decodes the watermark payload.
6. Looks up the corresponding event.
7. Matches the event to recipient and session.
8. Verifies the ML-DSA signature.
9. Verifies the document hash.
10. Verifies ledger block and chain integrity.
11. Presents the evidence chain.
12. Generates a forensic report.

# 7. CRYPTOGRAPHIC ARCHITECTURE

## Document encryption

Use **AES-256-GCM** for confidentiality and authenticated integrity of encrypted document content.

## Key establishment / document-key protection

Use **ML-KEM** for recipient-specific protection/establishment of the AES document key.

Conceptually:

```text
Document
   ↓
AES-256-GCM
   ↓
Encrypted document + AES key
                 ↓
        ML-KEM per recipient
                 ↓
       Recipient key package
```

## Event signature

Use **ML-DSA** to cryptographically bind the recorded event to the recipient identity/key and enable later verification.

## Hashing

Use SHA-256 where appropriate for document hashes, watermark-related hashes, event hashes and ledger block hashes.

# 8. WATERMARK ARCHITECTURE

The watermark must be:
- invisible to ordinary visual inspection
- recipient-specific
- session-specific
- document-specific
- extractable for forensic analysis

A conceptual payload may include:

```text
Document ID
Recipient ID
Session ID
Nonce
```

The payload should be encoded/hashed appropriately before embedding. Separate sessions for the same recipient/document must produce different fingerprints.

## Watermark technique

Target prototype technique: **DCT-based invisible watermarking**.

The intended approach is to operate on rendered PDF page images and embed a robust invisible signal in suitable frequency-domain components.

Do not replace this with a trivial visible watermark. Do not use LSB as the target design.

Where practical, use redundancy/error correction to improve extraction robustness.

Potential robustness tests:
- compression
- resizing
- screenshot/recapture where feasible

# 9. FORENSIC ATTRIBUTION LANGUAGE

Use:

**DECRYPTION EVENT MATCHED**

Prefer:
- recipient associated with the recorded decryption event
- watermark match
- cryptographically verifiable record
- signature verified
- ledger integrity verified
- event correlation

Avoid:
- "this recipient is guilty"
- "this person definitely leaked the document"
- "the leaker has been identified"

A watermark match establishes the recorded decryption event associated with the extracted fingerprint. It does not independently establish intent or physical distribution of the leaked file.

# 10. PRIVATE LEDGER ARCHITECTURE

The target is a **private/local tamper-evident chained ledger**. It is NOT a public blockchain.

Conceptual block:

```text
Block Number
Timestamp
Previous Hash
Event ID
Event Hash
Signature / Evidence Reference
Current Block Hash
```

Integrity relationship:

```text
Block N current_hash
        ↓
Block N+1.previous_hash
```

If a historical block is modified, verification must detect the broken chain.

The prototype may use a lightweight local chain rather than a large DLT framework. The final product should remain suitable for offline/air-gapped operation.

# 11. FOUR ROLES

## 11.1 Document Authority

May manage documents, initiate distributions, select authorized recipients, review release posture, view distribution history and status.

Should not be overloaded with low-level forensic internals.

## 11.2 Recipient

May view authorized documents, decrypt authorized documents, receive the protected copy and view own access/decryption history.

Should not see other recipients, other recipients' decryption events, private ledger internals, forensic investigations or private keys.

A high-level indication such as **Forensic Protection: Active ✓** is appropriate; raw watermark/session/ledger internals are not needed for ordinary recipient access.

## 11.3 Security Administrator

May inspect decryption events, recipient PQC identity/key status, private ledger, ledger integrity and system health.

May verify records but must not retroactively edit/delete immutable historical ledger evidence.

Does not automatically receive plaintext documents merely because technical evidence is accessible.

## 11.4 Forensic Investigator

May create investigations, ingest leaked documents, analyze watermarks, correlate events, verify cryptographic evidence, inspect evidence chains and generate reports.

# 12. APPROVED ROLE WORKFLOWS

## Authority

```text
Login
  ↓
Operations Dashboard
  ↓
Documents
  ↓
New Distribution
  ↓
Distribution Details
  ↓
History
```

## Recipient

```text
Login
  ↓
Workspace
  ↓
Authorized Document
  ↓
Secure Decryption
  ↓
Protected Document
  ↓
My Access History
```

## Security Administrator

```text
Login
  ↓
Security Operations
  ↓
Decryption Events
  ↓
PQC / Identity
  ↓
Private Ledger
  ↓
System Health
```

## Investigator

```text
Login
  ↓
Attribution Workspace
  ↓
New Investigation
  ↓
Forensic Analysis
  ↓
Evidence Chain
  ↓
Verification
  ↓
Report
```

Do not add pages unless they have a clear role in one of these workflows.

# 13. FORENSIC EVIDENCE CHAIN

```text
DOCUMENT
   ↓
RECIPIENT
   ↓
SESSION
   ↓
WATERMARK
   ↓
SIGNATURE
   ↓
LEDGER BLOCK
```

The detailed evidence view should make the relationship between each object explicit and should preferably be vertical.

# 14. PROPOSED DATA MODEL

Target entities:

```text
users
documents
recipients
distributions
decryption_sessions
watermarks
decryption_events
ledger_blocks
investigations
reports
```

Conceptual fields:

### users
```text
id
name
username
password_hash
role
status
created_at
```

### documents
```text
id
name
original_filename
classification
file_hash
encrypted_path
owner_id
created_at
status
```

### recipients
```text
id
user_id
recipient_code
pqc_public_key
pqc_key_status
created_at
```

### distributions
```text
id
document_id
authority_id
recipient_id
encrypted_key_package
distributed_at
status
```

### decryption_sessions
```text
id
document_id
recipient_id
session_id
started_at
completed_at
status
```

### watermarks
```text
id
document_id
recipient_id
session_id
watermark_id
watermark_hash
payload_hash
created_at
```

### decryption_events
```text
id
event_id
document_id
recipient_id
session_id
watermark_id
document_hash
watermark_hash
signature
timestamp
ledger_block_id
verification_status
```

### ledger_blocks
```text
id
block_number
timestamp
previous_hash
event_hash
event_id
signature
block_hash
```

### investigations
```text
id
investigation_id
investigator_id
document_id
uploaded_leak_path
watermark_id
matched_event_id
status
created_at
```

# 15. TARGET TECH STACK

## Frontend

Current direction:
- React
- TypeScript
- Wouter/router
- Tailwind CSS v4
- existing Shadcn UI library where useful

Do not discard the existing visual system merely to introduce a new framework.

## Backend target

- Python
- FastAPI
- SQLite for prototype/local persistence

## Cryptography target

- AES-256-GCM
- ML-KEM
- ML-DSA
- SHA-256
- DCT-based watermarking
- private/local tamper-evident ledger

# 16. OFFLINE / AIR-GAPPED DESIGN

The final system must operate without internet connectivity.

Constraints:
- no public blockchain network
- no mandatory cloud KMS
- no mandatory cloud storage
- no external online verification dependency
- cryptographic operations available locally
- private/local ledger
- recipient private keys protected locally

Any new dependency should be evaluated for offline deployment.

# 17. APPROVED UI / BRAND IDENTITY

Current approved visual direction:
- light mode only
- institutional
- government/defence operations feel
- modern but restrained
- icy cyan
- deep teal
- architectural / rectangular surfaces
- horizontal top navigation where appropriate
- strong information hierarchy
- clear operational workflows

Current visual tokens include approximately:

```text
Background: #DCE8E9
Surface:    #EAF4F5
Sheet:      #F1F8F8
Accent:     #C6FCFF
Highlight:  #92E6EC
Border:     #49A6AE
Primary:    #0F4C52
Dark:       #07383D
```

Current typography direction:
- Instrument Sans
- Manrope
- IBM Plex Mono for technical identifiers/data

Do not introduce purple/violet/indigo, cyberpunk neon, hacker aesthetics, terminal branding, excessive gradients, generic AI visuals, excessive pill-shaped UI, or generic green security badges everywhere.

# 18. BRANDING REQUIREMENTS

Product name: **SDMS**

Correct:
```text
SDMS
```

Incorrect:
```text
SDMS/
SDMS >
SDMS >_
```

Do not use a terminal icon or shell prompt as the product mark. Use a meaningful secure-document/security mark.

Preferred browser title:
**SDMS — Secure Document Management System**

Favicon should be a simple recognizable secure-document mark and remain legible at small sizes.

# 19. CURRENT FRONTEND PROTOTYPE STATUS

The existing repository is a frontend-first prototype using:
- in-memory React state
- mock users
- mock documents
- mock recipients
- mock decryption events
- mock watermarks
- mock ledger blocks
- simulated decryption processing
- simulated tamper/restore behavior
- simulated forensic analysis

This is expected at the prototype stage. Do not represent simulations as production cryptography.

# 20. CURRENT ROUTE MAP

## Shared
```text
/
/login
/login/:preset
```

## Authority
```text
/authority/dashboard
/authority/documents
/authority/distributions/new
/authority/distributions/:id
/authority/history
```

## Recipient
```text
/recipient/dashboard
/recipient/documents
/recipient/documents/:id
/recipient/decrypt/:id
/recipient/history
```

## Security Administrator
```text
/admin/dashboard
/admin/events
/admin/pqc
/admin/ledger
/admin/health
```

## Investigator
```text
/investigator/dashboard
/investigator/investigations/new
/investigator/investigations/:id
/investigator/evidence/:id
/investigator/reports
```

Routes may be refactored when necessary, but role separation and workflow clarity must remain.

# 21. CURRENT CODEBASE ARCHITECTURE

The prototype is concentrated in:

```text
artifacts/sdms-console/src/App.tsx
```

The file currently contains routing, pages, shared layout, state, mock data, drawers/modals and workflow components.

A substantial Shadcn UI library also exists.

A future modular structure may be:

```text
src/
├── components/
│   ├── layout/
│   ├── evidence/
│   ├── tables/
│   └── ui/
├── pages/
│   ├── auth/
│   ├── authority/
│   ├── recipient/
│   ├── admin/
│   └── investigator/
├── context/
├── services/
├── types/
├── lib/
└── App.tsx
```

Do not perform a blind rewrite.

# 22. CURRENT KNOWN IMPLEMENTATION ISSUES

The latest architecture audit identified:

### Critical evidence routing issue
The evidence page contains conflicting/dead routing logic. The case evidence view and interactive evidence-chain node details need to be separated cleanly. A possible target is:

```text
/investigator/evidence/:caseId
/investigator/chain/:nodeId
```

or another clean equivalent.

### Hardcoded route data
Several views render hardcoded records instead of using route parameters and centralized state, including distribution details and investigation analysis. Future detail views should bind to actual IDs/state.

### State disconnects
Current prototype transitions do not fully propagate. Target propagation:

```text
Authority release
      ↓
distribution state
      ↓
recipient authorized document
      ↓
recipient decryption
      ↓
decryption event
      ↓
watermark
      ↓
ledger event
      ↓
admin visibility
      ↓
investigator correlation
```

### Admin Events filter
The event-state filter is not fully connected to state and should eventually filter actual rows.

### Ledger verification
Current verification/tamper/restore behavior is simulated. Final implementation must calculate and verify the actual hash chain.

### Navigation
Nested routes should preserve correct parent navigation state instead of relying solely on exact URL equality.

# 23. IMPLEMENTATION ROADMAP

## PHASE 1 — UI + Workflow Foundation
**Status: Prototype / mostly implemented**

Goals:
- finalize branding
- fix navigation
- make all four role workflows understandable
- fix broken evidence routing
- remove redundant pages where appropriate
- improve Events page
- improve Private Ledger page
- make Evidence Chain vertical
- maintain approved visual identity

## PHASE 2 — Backend Foundation

Implement:
- FastAPI
- SQLite
- real persistence
- authentication
- role authorization
- document metadata
- distributions
- decryption events
- investigations

## PHASE 3 — Real Cryptography

Implement:
- AES-256-GCM
- ML-KEM
- ML-DSA
- local key handling
- document hashes
- event signatures

Do not expose private keys through the UI.

## PHASE 4 — Real Watermarking

Implement:
- PDF rendering
- DCT-based invisible watermark
- session-specific payload
- recipient-specific payload
- extraction
- decoding
- matching
- robustness testing where feasible

## PHASE 5 — Private Ledger

Implement:
- event hashing
- block creation
- previous-hash linking
- block hashing
- integrity verification
- tamper detection

Maintain offline/private operation.

## PHASE 6 — Forensic Investigation

```text
Leak upload
↓
Document analysis
↓
Watermark extraction
↓
Watermark match
↓
Event lookup
↓
ML-DSA verification
↓
Document hash verification
↓
Ledger verification
↓
Evidence chain
↓
Report
```

## PHASE 7 — End-to-End Integration

```text
Authority
↓
Encrypted distribution
↓
Recipient
↓
Local decryption
↓
Session watermark
↓
ML-DSA event signature
↓
Private ledger
↓
Leaked copy
↓
Investigator
↓
Watermark extraction
↓
Event correlation
↓
Cryptographic verification
↓
Attribution evidence
```

## PHASE 8 — SIH DEMO HARDENING

Focus on:
- offline execution
- reproducible demo data
- error handling
- clear security states
- evidence presentation
- performance
- documentation
- testing
- deployment instructions

# 24. SIH DEMONSTRATION SCENARIO

Controlled example:

```text
Document:
Strategic Operations Report

Recipient:
Ananya Sharma

Recipient ID:
REC-003

Example Session:
SES-20260926-8F3A

Example Watermark:
WM-7F83A2B9

Example Event:
DEC-000184
```

These are prototype/demo identifiers and must not be treated as production cryptographic values.

Demonstration story:
1. Authority distributes the document.
2. Ananya receives authorization.
3. Ananya performs local decryption.
4. A unique session watermark is generated.
5. A decryption event is signed.
6. The event is committed to the private ledger.
7. A leaked copy is supplied to the investigator.
8. Investigator extracts the watermark.
9. The watermark matches Ananya's recorded event.
10. Signature is verified.
11. Document hash is verified.
12. Ledger integrity is verified.
13. The evidence chain is shown.

# 25. IMPORTANT TERMINOLOGY

### Decryption Event
A recorded instance of a recipient decrypting a particular document.

### Session
A unique decryption session associated with a decryption event.

### Watermark
An invisible forensic fingerprint embedded into the recipient's decrypted copy.

### Signature
The recipient-bound cryptographic signature over the relevant event/evidence.

### Ledger
A private, tamper-evident chain of recorded evidence.

### Attribution
Association of a leaked document with a recorded decryption event through the evidence chain.

### Evidence Chain
**Document → Recipient → Session → Watermark → Signature → Ledger Block**

# 26. TERMINOLOGY TO AVOID

Avoid unless technically justified:
- unbreakable
- 100% secure
- leak-proof
- guaranteed attribution
- guilty
- culprit
- attacker for an ordinary recipient
- public blockchain
- cloud blockchain
- AI-powered security when AI is not actually involved
- quantum-proof as an absolute guarantee

Prefer precise descriptions of implemented properties.

# 27. SECURITY PRINCIPLES

1. Least privilege.
2. Role separation.
3. Private-key protection.
4. Recipient-side/local decryption.
5. Cryptographic verification.
6. Tamper-evident evidence.
7. Offline capability.
8. No unnecessary cloud dependencies.
9. Honest security-status communication.
10. Forensic neutrality.

# 28. AI DEVELOPMENT PROTOCOL

When an AI agent is asked to modify SDMS:

### First
Understand:
- `AGENTS.md`
- this file
- existing architecture
- affected source files

### Then
Inspect current behavior.

### Then
Plan.

### Then
Implement.

### Then
Test.

### Finally
Report:
- files changed
- what changed
- what was tested
- what remains simulated
- any architectural decisions introduced

The agent must not silently change the product specification.

# 29. DEFINITION OF DONE

The final SDMS prototype is successful when a controlled offline demonstration can show:

```text
Document Authority
    ↓
Encrypted distribution
    ↓
Recipient-specific key package
    ↓
Recipient local decryption
    ↓
Session-specific invisible watermark
    ↓
Recipient-bound ML-DSA signature
    ↓
Private tamper-evident ledger record
    ↓
Leaked document
    ↓
Watermark extraction
    ↓
Matching decryption event
    ↓
Signature verification
    ↓
Document hash verification
    ↓
Ledger verification
    ↓
Clear forensic evidence chain
    ↓
Forensic report
```

The demonstration must clearly distinguish real implementations from simulations.

# 30. MASTER PRINCIPLE

When choosing between technically possible implementations, prefer the implementation that:
1. satisfies the SIH problem statement,
2. preserves the cryptographic provenance objective,
3. preserves role separation,
4. supports offline/air-gapped operation,
5. is demonstrable within project scope,
6. is understandable to evaluators,
7. avoids unnecessary infrastructure,
8. does not make unsupported security claims.

**SDMS exists to create a trustworthy, cryptographically verifiable provenance trail for recipient-specific document decryption and forensic attribution.**
