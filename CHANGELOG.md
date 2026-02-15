# Changelog

All notable changes to `@brivora/verify` will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] — 2026-02-14

### Added

- **5-stage governance pipeline**: DEFINE, OBSERVE/PRE-EVALUATE, EXECUTE, POST-EVALUATE, PROVE
- **Merkle tree proofs**: SHA-3-256 tamper-evident proof generation
- **Post-quantum signatures**: ML-DSA-65 + Ed25519 hybrid via `@brivora/crypto`
- **Independent verification**: Proof verifiable with just proof + public key, no API or state required
- **EU AI Act v1 governance pack**: 7 rules covering Articles 12, 13, 14
  - `art-12-1-logging`, `art-12-2-traceability`, `art-12-3-monitoring`
  - `art-14-human-oversight`, `art-13-transparency`
  - `content-safety`, `pii-detection`
- **Minimal governance pack**: 2 rules for testing and development
- **11 rule evaluator types**: required, contains, regex, length, model_allowlist, model_blocklist, token_limit, pii_detection, toxicity, bias, custom
- **Weighted fidelity scoring**: 4 dimensions (transparency, traceability, safety, privacy)
- **Proof chaining**: `previous_proof` field for tamper-evident audit trails
- **Audit stores**: In-memory and file-based proof persistence
- **Compliance reports**: Structured report generation from evaluation results
- **Verifier identity management**: DID-based verifier creation and loading
- **Circuit-break on critical failures**: Pre-phase rule failures halt pipeline before AI execution
- Full TypeScript type definitions with strict mode
- Dual ESM + CommonJS output with source maps
- 125 tests across 11 test files
- Tamper detection tested: modified event hashes, Merkle roots, evidence chains all correctly detected

### Dependencies

- `@brivora/crypto` ^0.1.0

### Security

- All cryptographic operations via `@brivora/crypto` (audited @noble primitives)
- No telemetry, no network calls, no data collection
- PII detection for SSN, email, phone, credit card, IP patterns
- Toxicity and bias detection in governance rules
