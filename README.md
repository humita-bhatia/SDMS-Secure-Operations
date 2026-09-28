# SDMS — Secure Document Management System

> **Cryptographic provenance, controlled distribution, and forensic attribution of document decryption events.**  
> Smart India Hackathon (SIH 2026) · Problem Statement: 26237

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff.svg?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Summary

**SDMS** is a high-assurance Secure Document Management System designed for institutional environments where document movement must be strictly controlled, tracked, and attributable.

Unlike generic cloud storage or file-sharing portals, SDMS treats document distribution as an auditable cryptographic lifecycle:

$$\text{Distribute} \longrightarrow \text{Decrypt} \longrightarrow \text{Watermark} \longrightarrow \text{Sign} \longrightarrow \text{Chained Ledger} \longrightarrow \text{Leak} \longrightarrow \text{Extract} \longrightarrow \text{Match} \longrightarrow \text{Verify} \longrightarrow \text{Attribute}$$

SDMS guarantees that every decryption event is recipient-bound, session-specific, recorded into a tamper-evident SHA-256 local ledger, and forensically linkable through invisible watermarking and digital signatures.

---

## 🔐 Core Architecture & Roles

SDMS strictly separates responsibilities into **four institutional roles**:

```
                       ┌─────────────────────────────────────┐
                       │       Document Authority            │
                       │ (Release & Access Governance)       │
                       └──────────────────┬──────────────────┘
                                          │ Releases Doc
                                          ▼
                       ┌─────────────────────────────────────┐
                       │           Recipient                 │
                       │ (Local Decryption & Viewing)        │
                       └──────────────────┬──────────────────┘
                                          │ Records Decryption Event
                                          ▼
                       ┌─────────────────────────────────────┐
                       │      Security Administrator         │
                       │ (Audits, PQC & Ledger Integrity)    │
                       └──────────────────┬──────────────────┘
                                          │ Investigates Leak
                                          ▼
                       ┌─────────────────────────────────────┐
                       │       Forensic Investigator         │
                       │ (Extraction, Evidence & Attribution)│
                       └─────────────────────────────────────┘
```

### 1. Document Authority
- Oversees distribution packages, security classifications, and recipient permissions.
- Configures recipient access groups and sets release locks.
- Inspects active release lifecycles without viewing recipient private keys or investigator case files.

### 2. Recipient
- Secure workspace displaying only documents cleared for that specific identity.
- Performs staged client-side decryption (session nonce generation, key negotiation, and watermark binding).
- Renders protected document views.
- Strict isolation: Recipients cannot view other recipients' events, forensic analysis, or ledger internals.

### 3. Security Administrator
- Real-time audit log of all decryption events (`DEC-000181` ... `DEC-000185`).
- Post-Quantum Cryptography (PQC) posture and key status monitoring.
- **Private Chained Ledger**: Built with client-side SHA-256 hashing.
  - Interactive **Verify Ledger** (deterministic block hash re-derivation).
  - Interactive **Simulate Tamper** (demonstrates hash mismatch propagation across blocks).
  - Interactive **Restore Test State**.
- Operational health checks and engine status metrics.

### 4. Forensic Investigator
- Dedicated leak attribution workspace.
- Uploads intercepted/leaked document fragments.
- Extracts recipient-bound session watermarks.
- Renders the **Vertical Evidence Chain**:
  $$\text{Document} \longrightarrow \text{Recipient} \longrightarrow \text{Session} \longrightarrow \text{Watermark} \longrightarrow \text{Signature} \longrightarrow \text{Ledger Block}$$
- Detailed node inspections and forensic report generation.

---

## 🛡️ Cryptographic & Security Architecture

| Capability | Target Production Architecture | Prototype / Demo Posture |
|------------|--------------------------------|--------------------------|
| **Document Encryption** | AES-256-GCM | Client-side staged simulation |
| **Key Establishment** | ML-KEM (Post-Quantum) | Structured protocol workflow simulation |
| **Digital Signatures** | ML-DSA (Post-Quantum) | Structured protocol workflow simulation |
| **Hash Verification** | SHA-256 | **Real SHA-256 chain via Web Crypto API** |
| **Fingerprint Watermarking** | DCT-based invisible watermark | Staged perceptual extraction workflow |
| **Audit Ledger** | Private / local tamper-evident chained ledger | **Deterministic SHA-256 block hash chain** |
| **Deployment Mode** | Fully offline / air-gapped capable | Zero external service dependencies |

---

## ⚡ Quickstart

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` / `v24.x`
- **pnpm**: `v9.x` or `v10.x` (or `npm`)

### 1. Clone the repository
```bash
git clone https://github.com/humita-bhatia/SDMS-Secure-Operations.git
cd SDMS-Secure-Operations
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Start the SDMS Operations Console
```bash
# Navigate to the console artifact or run from root
cd artifacts/sdms-console
npm run dev
```

Open your browser at **`http://localhost:5173/`**.

---

## 🔑 Demo Credentials

All accounts share the password **`demo`**:

| Role | Username | Password | Identity Details |
|------|----------|----------|------------------|
| **Document Authority** | `authority` | `demo` | Release Operations Desk |
| **Recipient (Lead)** | `ananya` | `demo` | Ananya Sharma (`REC-003`) |
| **Recipient** | `rahul` | `demo` | Rahul Mehta (`REC-004`) |
| **Recipient** | `vikram` | `demo` | Vikram Singh (`REC-005`) |
| **Security Administrator** | `admin` | `demo` | Security Operations Desk |
| **Forensic Investigator** | `investigator` | `demo` | Forensic Attribution Desk |

---

## 🧪 Verification & Testing

To verify TypeScript types across the codebase:

```bash
cd artifacts/sdms-console
npm run typecheck
```

---

## 📂 Project Structure

```
├── artifacts/
│   ├── sdms-console/               # Primary SDMS React + Vite application
│   │   ├── src/
│   │   │   ├── App.tsx             # Main routing & application shell
│   │   │   ├── store.tsx           # Centralized reactive state & SHA-256 ledger engine
│   │   │   ├── index.css           # Institutional cyan/deep-teal design system
│   │   │   ├── components/
│   │   │   │   ├── shared.tsx      # TopNav, MetricStrip, DataTable, Drawers
│   │   │   │   └── ui/             # Accessible UI components (Radix primitives)
│   │   │   └── pages/
│   │   │       ├── authority.tsx   # Document Authority dashboards & releases
│   │   │       ├── recipient.tsx   # Recipient document register & decryption
│   │   │       ├── admin.tsx       # Audit events, PQC posture, & Private Ledger
│   │   │       └── investigator.tsx # Leak forensics, vertical evidence chain & report
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── api-server/                 # Backend API service (Express)
│   └── mockup-sandbox/             # Component preview harness
├── lib/
│   ├── api-spec/                   # OpenAPI specifications & Orval configuration
│   ├── api-zod/                    # Zod validation schemas
│   ├── api-client-react/           # Generated typed API hooks
│   └── db/                         # Drizzle ORM schema & DB connection
├── package.json                    # Workspace root
└── pnpm-workspace.yaml             # Workspace definition
```

---

## 🎨 Visual Identity

SDMS adheres to a strict, institutional design language:
- **Palette**: Deep teal (`#0F4C52`), dark primary (`#07383D`), mist cyan (`#DCE8E9`), light accent (`#C6FCFF`), and crisp borders (`#B7CED0`).
- **Typography**: Clean, high-legibility geometric sans (`Instrument Sans`, `Manrope`) paired with technical monospace (`IBM Plex Mono`).
- **Principles**: Rectangular geometry, institutional status pills, high contrast, zero unnecessary neon/cyberpunk aesthetics.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
