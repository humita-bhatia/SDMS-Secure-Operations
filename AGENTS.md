# SDMS — AGENT RULES

**Project:** Secure Document Management System (SDMS)  
**SIH:** Smart India Hackathon 2026  
**Problem Statement:** 26237  
**Rule status:** NON-NEGOTIABLE

This file defines how an AI coding agent must work on this repository.

## 1. READ THE PROJECT CONTEXT FIRST

Before making any code change, read:
- `context.md`
- existing `replit.md`
- relevant source files
- relevant files under `attached_assets/`

`context.md` is the product and implementation source of truth.

## 2. EXPLORE → PLAN → EXECUTE

For every non-trivial task:
1. Inspect the current implementation.
2. Identify affected files and existing behavior.
3. Compare the requested change with `context.md`.
4. State the implementation plan.
5. Make the smallest appropriate change.
6. Run/build/test the affected application.
7. Verify existing role workflows still work.

Do not immediately rewrite the project.

## 3. PRESERVE WORKING FUNCTIONALITY

Do not rewrite the entire application unless explicitly instructed. Prefer incremental changes, targeted refactoring, reuse of existing components, preserving valid routes, preserving approved visual design, and preserving working interactions.

Do not delete working functionality simply because another implementation would be cleaner.

## 4. SDMS IS NOT A GENERIC FILE-SHARING APP

The core purpose is **cryptographic provenance + forensic attribution of recipient-specific document decryption events**.

The central system story is:

**Distribute → Decrypt → Watermark → Sign → DLT → Leak → Extract → Match → Verify → Attribute**

Do not redesign SDMS into Google Drive, Dropbox, a generic document portal, a generic cybersecurity dashboard, a generic AI dashboard, or a public blockchain application.

## 5. FOUR ROLES MUST REMAIN SEPARATE

The four roles are:
1. Document Authority
2. Recipient
3. Security Administrator
4. Forensic Investigator

Do not merge roles or expose another role's sensitive information merely for convenience.

### Document Authority
May manage documents, recipients, distributions and release status. Should not be overloaded with low-level forensic internals.

### Recipient
May see authorized documents and their own access/decryption history. Must not see other recipients, other recipients' events, private ledger internals, forensic investigations, or private keys.

### Security Administrator
May inspect decryption events, PQC identity status, ledger state, verification status and system health. May verify records but must not edit/delete historical ledger evidence. Does not automatically receive plaintext documents.

### Forensic Investigator
May inspect leaked documents, watermark analysis, matching events, cryptographic evidence, evidence chains and reports. Does not gain document-distribution powers merely because they can investigate.

## 6. NEVER INVENT SECURITY

Maintain a strict distinction between simulated/mock, implemented and planned functionality.

Never call simulated behavior real cryptography, real blockchain, real watermarking, or cryptographically verified unless the implementation actually performs it.

Never fabricate cryptographic outputs or security guarantees. If a feature is simulated, use honest terminology such as `Simulated`, `Prototype`, `Planned`, or `Test state` until it becomes real.

## 7. CRYPTOGRAPHIC TARGET ARCHITECTURE

Target components:
- **AES-256-GCM** for document encryption
- **ML-KEM** for recipient-specific key establishment/protection of the document key
- **ML-DSA** for recipient-bound digital signatures
- **SHA-256** where appropriate for hashes
- **DCT-based invisible watermarking**
- **private/local tamper-evident ledger**

Do not silently replace these with unrelated mechanisms. Explain and document any necessary architectural change.

## 8. PRIVATE KEYS

Never display, log, commit, or place recipient private keys into ledger records. Private keys must remain protected locally once real cryptography is implemented.

## 9. OFFLINE / AIR-GAPPED REQUIREMENT

The final system must support offline / fully air-gapped operation.

Do not introduce mandatory dependencies on public blockchain networks, public cloud KMS, cloud storage, or online verification services.

## 10. WATERMARKING REQUIREMENTS

The target watermark is invisible, recipient-specific, session-specific, document-specific and extractable for forensic analysis.

Separate decryption sessions for the same recipient/document must produce different fingerprints.

Target technique: **DCT-based invisible watermarking**. Do not replace this with a trivial visible watermark or LSB as the target design.

A watermark match identifies the recorded decryption event associated with the extracted fingerprint. It does not by itself prove intentional leaking, malicious intent, physical distribution, or guilt.

## 11. LEDGER REQUIREMENTS

The target is a **private/local tamper-evident chained ledger**, not a public blockchain.

Conceptual block fields:
- block number
- timestamp
- previous hash
- event ID
- event hash
- signature/evidence reference
- current block hash

Changing a historical block must cause integrity verification to fail through the hash chain.

## 12. UI / VISUAL IDENTITY

Approved direction:
- institutional
- secure
- modern
- light mode
- icy cyan
- deep teal
- architectural / rectangular
- restrained
- professional

Current visual tokens include approximately `#DCE8E9` background and `#0F4C52` primary deep teal.

Do NOT introduce purple/violet/indigo, generic neon cyberpunk styling, hacker imagery, terminal/shell branding, generic AI-dashboard styling, excessive gradients, excessive pill-shaped UI, or generic green security pills.

## 13. SDMS BRANDING

Product name: **SDMS**

Do not display `SDMS/`, `SDMS >`, or `SDMS >_`.

Do not use terminal prompts, shell symbols, or generic hacker icons as the product mark.

Use a meaningful secure-document/security mark.

Preferred browser title: **SDMS — Secure Document Management System**

Favicon should be a simple recognizable secure-document mark.

## 14. NAVIGATION MUST HAVE A PURPOSE

Do not add pages merely to increase screen count. Every page must have a clear role in the end-to-end workflow. Avoid redundant pages showing the same information in slightly different forms.

## 15. APPROVED ROLE FLOWS

### Authority
Login → Operations Dashboard → Documents → New Distribution → Distribution Details → History

### Recipient
Login → Workspace → Authorized Document → Secure Decryption → Protected Document → My Access History

### Security Administrator
Login → Security Operations → Decryption Events → PQC / Identity → Private Ledger → System Health

### Forensic Investigator
Login → Attribution Workspace → New Investigation → Forensic Analysis → Evidence Chain → Verification → Report

## 16. FORENSIC EVIDENCE CHAIN

The evidence relationship is:

**Document → Recipient → Session → Watermark → Signature → Ledger Block**

The detailed evidence view should preferably present this chain vertically.

## 17. CURRENT CODEBASE SAFETY

The current frontend is a prototype with centralized state and a large `App.tsx`. Before modularizing, understand the existing state model, preserve routes and role guards, preserve mock-data semantics, preserve approved UI tokens, and verify the app after each refactor.

Do not perform a blind rewrite.

## 18. ROUTE AND STATE RULES

Route parameters must eventually correspond to actual application state. Do not render unrelated hardcoded data for every dynamic `:id`. State changes must propagate across roles where the workflow requires it.

Target propagation:

Authority release → distribution state → recipient authorized document → recipient decryption → decryption event → watermark → ledger event → admin visibility → investigator correlation.

## 19. CURRENT KNOWN ISSUES

The latest architecture audit identified:
- monolithic `App.tsx`
- hardcoded route data in detail views
- disconnected release/decryption state
- unmanaged Admin Events filter
- weak/dynamic route binding
- duplicated recipient register presentation
- problematic EvidencePage routing/dead code
- inconsistent nested-route navigation state
- ledger verification currently relying on simulated/local notice state

Treat these as known issues, not reasons to redesign the whole application. Fix incrementally.

## 20. CHANGE CONTROL

If a requested change conflicts with `context.md`:
1. Identify the conflict.
2. Explain it briefly.
3. Do not silently choose a conflicting architecture.
4. Prefer the existing specification.
5. If the specification must change, update `context.md` as part of the approved architectural decision.

Do not silently reinterpret SIH requirements.

## 21. DO NOT OVERENGINEER

This is an SIH prototype that must demonstrate a credible end-to-end concept. Prefer understandable architecture, demonstrable functionality, deterministic testing, local/offline operation, clear evidence and maintainable code.

Do not add unnecessary enterprise infrastructure merely to make the architecture look impressive.

## 22. DEFINITION OF DONE FOR ANY CHANGE

Before considering a task complete, verify:
- requested behavior works
- relevant routes still work
- four role boundaries remain intact
- no unrelated feature was broken
- no duplicate workflow was introduced
- UI remains consistent
- security claims remain truthful
- mock vs real status is clear
- no sensitive keys/secrets were exposed
- offline/air-gapped compatibility is preserved where applicable
- implementation remains aligned with `context.md`
