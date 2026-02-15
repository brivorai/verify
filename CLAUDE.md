# @brivora/verify — Builder Context

> 5 lines of code to make any AI call verifiable. Ships SECOND. First revenue.

---

## READ FIRST

Before starting any session, read:
1. This file (CLAUDE.md)
2. `D:\brivora\Reference\CLAUDE_MEMORY.md` — full project context, strategy, decisions
3. `D:\brivora\Products\Verify\Overview.md` — product spec
4. `D:\brivora\Products\Crypto\Overview.md` — crypto layer this depends on

## What You Are Building

`@brivora/verify` — A lightweight wrapper that takes ANY AI API call, applies governance rules, and generates a cryptographic proof of compliance. PQC-signed Merkle root via `@brivora/crypto`. Independently verifiable. The "Stripe for AI governance."

**Five lines:**
```typescript
import { verify } from '@brivora/verify';

const result = await verify.govern(
  () => anthropic.messages.create({
    model: 'claude-opus-4-6',
    messages: [{ role: 'user', content: 'Analyze this loan application' }]
  }),
  { governance: 'eu-ai-act-v1', audit: true }
);

console.log(result.output);  // The AI response
console.log(result.proof);   // PQC-signed Merkle root
console.log(result.valid);   // true
console.log(result.report);  // Compliance report
console.log(result.score);   // Fidelity score 0.0-1.0
```

## Architecture

### Pipeline (5 stages, every AI call flows through all of them)

```
INPUT (AI call function + governance config)
  │
  ▼
┌─────────────────────────────────────┐
│  1. DEFINE                          │
│  Load governance pack (rule set)    │
│  Resolve rules, thresholds, config  │
│  Record: GOVERNANCE_LOADED event    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. OBSERVE + PRE-EVALUATE          │
│  Capture: prompt, model, params     │
│  Run pre-call governance rules      │
│  Record: PROMPT_RECEIVED event      │
│  Record: PRE_EVALUATION event       │
│  If FAIL → short-circuit, return    │
│  governance violation (no AI call)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. EXECUTE                         │
│  Call the user's AI function        │
│  Capture: response, timing, tokens  │
│  Record: MODEL_INVOCATION event     │
│  Record: RESPONSE_RECEIVED event    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. POST-EVALUATE                   │
│  Run post-call governance rules     │
│  Score: fidelity across dimensions  │
│  Record: POST_EVALUATION event      │
│  Record: FIDELITY_SCORE event       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. PROVE                           │
│  Build Merkle tree from all events  │
│  Sign root with @brivora/crypto     │
│  Chain to previous proof            │
│  Record: PROOF_GENERATED event      │
│  Return: GovernResult with proof    │
└─────────────────────────────────────┘
```

### Key Design Principles

1. **Wrapper, not middleware.** verify.govern() wraps a function. It doesn't require modifying the AI SDK or installing a middleware framework. Works with Anthropic, OpenAI, Google, Mistral, Ollama, any function that returns a promise.

2. **The AI call is opaque.** Verify doesn't know or care which AI provider you're using. It receives a function, calls it, captures the result. The governance rules operate on the input/output, not the provider internals.

3. **Proofs are self-contained.** A BrivoraProof contains everything needed for independent verification. No API call. No database lookup. No Brivora account. Just the proof + a public key + a hash function.

4. **Governance packs are data, not code.** A governance pack is a JSON/YAML definition of rules, thresholds, and scoring dimensions. No executable code in packs (security). The verify engine interprets packs.

5. **Zero side effects by default.** verify.govern() doesn't write to disk, doesn't make network calls (beyond the user's AI call), doesn't log anywhere. The proof is returned in memory. Persistence is the caller's responsibility (or use the optional audit store).

## Technical Spec

### Core Dependencies
- `@brivora/crypto` — PQC signatures, Merkle tree hashing, identity
- No other runtime dependencies. Keep it minimal.

### API Surface

```typescript
// ============================================
// CORE — The main API
// ============================================

// Wrap any AI call with governance
verify.govern<T>(
  fn: () => Promise<T>,
  options: GovernOptions
): Promise<GovernResult<T>>

// Verify a proof independently (static, no state)
verify.check(
  proof: BrivoraProof,
  publicKey: PublicKey
): Promise<VerifyResult>

// ============================================
// IDENTITY — Verification engine identity
// ============================================

// Create a verifier identity (key pair for signing proofs)
verify.createVerifier(
  options?: VerifierOptions
): Promise<Verifier>

// Load an existing verifier from stored keys
verify.loadVerifier(
  privateKey: PrivateKey
): Promise<Verifier>

// ============================================
// GOVERNANCE PACKS — Rule definitions
// ============================================

// Load a built-in governance pack
verify.loadPack(
  name: string  // 'eu-ai-act-v1', 'hipaa-v1', etc.
): GovernancePack

// Load a custom governance pack from JSON/YAML
verify.loadPackFromFile(
  path: string
): Promise<GovernancePack>

// Create a governance pack programmatically
verify.createPack(
  definition: PackDefinition
): GovernancePack

// List available built-in packs
verify.listPacks(): string[]

// ============================================
// AUDIT — Optional persistence
// ============================================

// Create an audit store (optional, for proof persistence)
verify.createAuditStore(
  options: AuditStoreOptions  // { path: string } for file, or custom adapter
): AuditStore

// ============================================
// PROOF CHAIN — Link proofs together
// ============================================

// Create a proof chain (sequential proofs linked by previous_proof)
verify.createChain(
  verifier: Verifier
): ProofChain

// Verify an entire chain of proofs
verify.checkChain(
  proofs: BrivoraProof[],
  publicKey: PublicKey
): Promise<ChainVerifyResult>
```

### Type Definitions

```typescript
// === Core Types ===

interface GovernOptions {
  governance: string | GovernancePack;  // pack name or loaded pack
  audit?: boolean;                      // enable detailed event capture (default: true)
  verifier?: Verifier;                  // signing identity (auto-creates ephemeral if not provided)
  chain?: ProofChain;                   // link to previous proofs
  metadata?: Record<string, unknown>;   // user-defined metadata included in proof
  onPreEval?: (ctx: EvalContext) => void;   // hook: after pre-evaluation
  onPostEval?: (ctx: EvalContext) => void;  // hook: after post-evaluation
  timeout?: number;                     // max ms for the AI call (default: 30000)
}

interface GovernResult<T> {
  output: T;                    // the AI call's return value (passthrough)
  proof: BrivoraProof;          // cryptographic governance proof
  valid: boolean;               // did all governance checks pass?
  report: ComplianceReport;     // human-readable compliance report
  score: FidelityScore;         // composite governance score
  events: GovernanceEvent[];    // full event chain (if audit: true)
  timing: {
    total: number;              // total ms including governance overhead
    aiCall: number;             // ms for the AI call alone
    governance: number;         // ms for governance evaluation
    proof: number;              // ms for proof generation
  };
}

// === Proof Types ===

interface BrivoraProof {
  version: '1.0';
  timestamp: string;                    // ISO-8601
  subject: string;                      // DID or identifier of the AI system
  verifier: string;                     // DID or identifier of the verification engine
  governance_policy: ContentHash;       // hash of the governance pack used
  system_state_hash: ContentHash;       // hash of system state at time of evaluation
  fidelity_score: FidelityScore;
  evaluation_result: 'PASS' | 'FAIL' | 'PARTIAL';
  evidence_chain: ContentHash[];        // ordered hashes of each event
  merkle_root: ContentHash;             // root of the Merkle tree
  signature: Uint8Array;                // ML-DSA-65 + Ed25519 hybrid signature (via @brivora/crypto)
  public_key: Uint8Array;              // verifier's public key (for self-contained verification)
  previous_proof?: ContentHash;         // link to previous proof in chain
  metadata?: Record<string, unknown>;   // user-defined metadata
}

interface ContentHash {
  algorithm: 'sha3-256';
  value: string;  // hex-encoded
}

interface FidelityScore {
  overall: number;                      // 0.0 - 1.0
  dimensions: Record<string, number>;   // per-dimension scores
  threshold: number;                    // minimum passing score
  passed: boolean;                      // overall >= threshold
}

interface VerifyResult {
  valid: boolean;                       // signature verifies AND merkle root matches
  proof: BrivoraProof;                  // the proof that was verified
  governance_policy: ContentHash;       // which governance was applied
  evaluation_result: 'PASS' | 'FAIL' | 'PARTIAL';
  timestamp: string;
  chain_valid?: boolean;                // if previous_proof exists, did it verify?
}

// === Governance Event Types ===

type GovernanceEventType =
  | 'GOVERNANCE_LOADED'
  | 'PROMPT_RECEIVED'
  | 'PRE_EVALUATION'
  | 'MODEL_INVOCATION'
  | 'RESPONSE_RECEIVED'
  | 'POST_EVALUATION'
  | 'FIDELITY_SCORE'
  | 'PROOF_GENERATED'
  | 'GOVERNANCE_VIOLATION'
  | 'CIRCUIT_BREAK';

interface GovernanceEvent {
  type: GovernanceEventType;
  timestamp: string;
  hash: ContentHash;                    // hash of this event's data
  data: Record<string, unknown>;        // event-specific data
  parent_hash?: ContentHash;            // hash of previous event (chain within proof)
}

// === Governance Pack Types ===

interface GovernancePack {
  name: string;                         // 'eu-ai-act-v1'
  version: string;                      // semver
  description: string;
  rules: GovernanceRule[];
  scoring: ScoringConfig;
  metadata: Record<string, unknown>;
}

interface GovernanceRule {
  id: string;                           // 'art-12-logging', 'art-14-human-oversight'
  name: string;                         // human-readable name
  description: string;
  phase: 'pre' | 'post' | 'both';      // when to evaluate
  severity: 'critical' | 'high' | 'medium' | 'low';
  evaluate: RuleEvaluator;             // the evaluation logic
}

// Rule evaluators are predefined functions, NOT arbitrary code
// This prevents governance packs from executing malicious code
type RuleEvaluator =
  | { type: 'contains'; field: string; values: string[]; negate?: boolean }
  | { type: 'regex'; field: string; pattern: string; negate?: boolean }
  | { type: 'length'; field: string; min?: number; max?: number }
  | { type: 'required'; fields: string[] }
  | { type: 'model_allowlist'; models: string[] }
  | { type: 'model_blocklist'; models: string[] }
  | { type: 'token_limit'; max_input?: number; max_output?: number }
  | { type: 'pii_detection'; fields: string[]; action: 'flag' | 'redact' | 'block' }
  | { type: 'toxicity_threshold'; max_score: number }
  | { type: 'bias_detection'; protected_attributes: string[] }
  | { type: 'custom'; fn: string };     // named function from registry (NOT arbitrary code)

interface ScoringConfig {
  dimensions: ScoringDimension[];
  threshold: number;                    // overall passing score (0.0 - 1.0)
  weights: Record<string, number>;      // dimension weights (must sum to 1.0)
}

interface ScoringDimension {
  name: string;                         // 'transparency', 'fairness', 'safety', etc.
  rules: string[];                      // rule IDs that contribute to this dimension
}

// === Verifier Types ===

interface Verifier {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  fingerprint: string;
  sign(data: Uint8Array): Promise<Uint8Array>;
}

interface VerifierOptions {
  existingKey?: PrivateKey;             // reuse an @brivora/crypto key
}

// === Audit Store Types ===

interface AuditStore {
  save(proof: BrivoraProof): Promise<void>;
  load(hash: ContentHash): Promise<BrivoraProof | null>;
  list(options?: { limit?: number; offset?: number }): Promise<BrivoraProof[]>;
  chain(options?: { from?: ContentHash }): Promise<BrivoraProof[]>;
}

interface AuditStoreOptions {
  type: 'file' | 'memory' | 'custom';
  path?: string;                        // for 'file' type
  adapter?: AuditStore;                 // for 'custom' type
}

// === Compliance Report Types ===

interface ComplianceReport {
  timestamp: string;
  governance_pack: string;
  governance_version: string;
  overall_result: 'PASS' | 'FAIL' | 'PARTIAL';
  fidelity_score: FidelityScore;
  rule_results: RuleResult[];
  recommendations: string[];
  proof_hash: ContentHash;
}

interface RuleResult {
  rule_id: string;
  rule_name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  result: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  evidence?: Record<string, unknown>;
}
```

### Project Structure

```
@brivora/verify/
├── src/
│   ├── index.ts              # Public API re-exports
│   ├── verify.ts             # Main facade (verify.govern, verify.check)
│   ├── pipeline.ts           # 5-stage governance pipeline
│   ├── evaluator.ts          # Rule evaluation engine
│   ├── proof.ts              # Merkle tree + proof generation
│   ├── chain.ts              # Proof chaining
│   ├── pack.ts               # Governance pack loading/validation
│   ├── score.ts              # Fidelity scoring engine
│   ├── report.ts             # Compliance report generation
│   ├── events.ts             # Event recording and hashing
│   ├── verifier.ts           # Verifier identity management
│   ├── audit.ts              # Audit store (file, memory, custom)
│   ├── types.ts              # All TypeScript type definitions
│   └── packs/
│       ├── index.ts           # Pack registry
│       ├── eu-ai-act-v1.ts    # EU AI Act Article 12 governance rules
│       └── minimal.ts         # Minimal pack for testing/getting started
├── tests/
│   ├── govern.test.ts         # Core govern() flow
│   ├── pipeline.test.ts       # Pipeline stage tests
│   ├── evaluator.test.ts      # Rule evaluation tests
│   ├── proof.test.ts          # Merkle tree + proof generation
│   ├── chain.test.ts          # Proof chaining
│   ├── pack.test.ts           # Pack loading/validation
│   ├── score.test.ts          # Fidelity scoring
│   ├── report.test.ts         # Report generation
│   ├── audit.test.ts          # Audit store tests
│   ├── verify-check.test.ts   # Independent verification
│   └── integration.test.ts    # Full flow integration tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── LICENSE                    # AGPL-3.0
└── CLAUDE.md                  # This file
```

### Merkle Tree Implementation

The Merkle tree is the core data structure that makes proofs tamper-evident.

```
                    [Root Hash]          ← This gets signed
                   /           \
            [Hash AB]           [Hash CD]
           /        \          /        \
     [Hash A]   [Hash B]  [Hash C]  [Hash D]
        |          |         |          |
   Event 0    Event 1   Event 2    Event 3
   (GOVERN_    (PROMPT_   (MODEL_    (POST_
    LOADED)    RECEIVED)  INVOKE)    EVAL)
```

Each leaf is the SHA-3-256 hash of a serialized GovernanceEvent. Internal nodes are `SHA3-256(left || right)`. The root hash is signed with `@brivora/crypto.sign()`.

To verify: reconstruct the tree from events, compute the root, verify the signature. If any event was modified, the root hash changes, and the signature is invalid.

### EU AI Act v1 Governance Pack

The first built-in governance pack. Maps to Article 12 requirements:

```typescript
const euAiActV1: PackDefinition = {
  name: 'eu-ai-act-v1',
  version: '1.0.0',
  description: 'EU AI Act Article 12 — Automatic recording of events for high-risk AI systems',
  rules: [
    {
      id: 'art-12-1-logging',
      name: 'Automatic event logging',
      description: 'All events must be automatically recorded (Art. 12(1))',
      phase: 'both',
      severity: 'critical',
      evaluate: { type: 'required', fields: ['prompt', 'model', 'response', 'timestamp'] }
    },
    {
      id: 'art-12-2-traceability',
      name: 'Event traceability',
      description: 'Logs must enable tracing back to specific decisions (Art. 12(2))',
      phase: 'post',
      severity: 'critical',
      evaluate: { type: 'required', fields: ['model', 'parameters', 'response', 'timing'] }
    },
    {
      id: 'art-12-3-monitoring',
      name: 'Monitoring capability',
      description: 'System must support post-deployment monitoring (Art. 12(3))',
      phase: 'post',
      severity: 'high',
      evaluate: { type: 'required', fields: ['fidelity_score', 'evaluation_result'] }
    },
    {
      id: 'art-14-human-oversight',
      name: 'Human oversight data',
      description: 'Sufficient information for human oversight (Art. 14)',
      phase: 'post',
      severity: 'high',
      evaluate: { type: 'required', fields: ['prompt', 'response', 'governance_result'] }
    },
    {
      id: 'art-13-transparency',
      name: 'Transparency — model identification',
      description: 'AI system must be identifiable (Art. 13)',
      phase: 'pre',
      severity: 'high',
      evaluate: { type: 'required', fields: ['model'] }
    },
    {
      id: 'content-safety',
      name: 'Content safety baseline',
      description: 'Flag potentially harmful content in prompts',
      phase: 'pre',
      severity: 'medium',
      evaluate: { type: 'toxicity_threshold', max_score: 0.8 }
    },
    {
      id: 'pii-detection',
      name: 'PII detection in prompts',
      description: 'Detect personal data in AI inputs',
      phase: 'pre',
      severity: 'medium',
      evaluate: { type: 'pii_detection', fields: ['prompt'], action: 'flag' }
    }
  ],
  scoring: {
    dimensions: [
      { name: 'transparency', rules: ['art-13-transparency', 'art-12-1-logging'] },
      { name: 'traceability', rules: ['art-12-2-traceability', 'art-12-3-monitoring'] },
      { name: 'safety', rules: ['content-safety', 'art-14-human-oversight'] },
      { name: 'privacy', rules: ['pii-detection'] }
    ],
    threshold: 0.7,
    weights: {
      transparency: 0.3,
      traceability: 0.3,
      safety: 0.25,
      privacy: 0.15
    }
  }
};
```

### OSCAL Compatibility

Proofs should be exportable in NIST OSCAL format. This is a stretch goal for v1 but architecturally planned:

```typescript
// Future API (v1.1+)
const oscalResult = verify.toOSCAL(proof);
// Returns OSCAL Assessment Results JSON with the BrivoraProof
// embedded as evidence artifacts
```

The proof structure is designed so that:
- `governance_policy` maps to OSCAL control identifiers
- `evaluation_result` maps to OSCAL assessment results
- `evidence_chain` maps to OSCAL evidence artifacts
- `fidelity_score` maps to OSCAL risk assessments

## Build & Test

- **Runtime:** Node.js 20+ (LTS)
- **Build:** TypeScript → ESM + CJS dual output (tsup or unbuild)
- **Test:** Vitest
- **Lint:** Biome
- **Package manager:** pnpm

### Testing Strategy

1. **Unit tests per module:** Each src/ file has a corresponding test file
2. **Mock AI calls in tests:** Don't make real API calls. Mock functions that return canned responses.
3. **Proof verification round-trip:** Generate proof → serialize → deserialize → verify. Must always pass.
4. **Tamper detection:** Generate proof → modify one event → verify. Must always FAIL.
5. **Chain verification:** Generate 5 chained proofs → verify chain. Modify one → chain verification fails.
6. **Governance pack validation:** Load each built-in pack → validate schema → run against test cases.
7. **Performance:** Governance overhead should be <50ms for a typical AI call (excluding the AI call itself).

### Quality Bar

- 100% test coverage on proof generation and verification (non-negotiable)
- Every governance rule evaluator tested with pass AND fail cases
- Merkle tree tested with known vectors
- Integration test: full govern() → check() round-trip
- README with "5 lines" quick start front and center
- EU AI Act governance pack tested against realistic scenarios

## Non-Functional Requirements

- **Zero telemetry.** No analytics. No phone home. No usage reporting.
- **No network calls** (except the user's AI call which verify wraps).
- **Deterministic proofs.** Same inputs + same key = same proof (for testing).
- **Proof size budget.** A typical proof should be <10KB (excluding the AI response content).
- **Latency budget.** Governance overhead (excluding AI call) should be <50ms.
- **Memory budget.** Holding 1000 events in memory before proof generation should use <10MB.

## What NOT to Build (Scope Boundaries)

- **AI provider SDKs** — verify wraps a function. It doesn't know about Anthropic/OpenAI/etc.
- **Dashboard/UI** — verify is a library, not a platform. UI comes with Brivora Cloud.
- **Hosted verification API** — verify runs locally. Brivora Cloud (future) hosts it.
- **Custom rule engine** — governance packs use predefined evaluator types, not arbitrary code.
- **User authentication** — verify has verifier identities (crypto keys), not user accounts.
- **Rate limiting / billing** — that's Brivora Cloud's job. The library is unlimited.
- **PII detection implementation** — for v1, PII detection can be basic regex patterns (SSN, email, phone). Production-grade NER comes later or via external integration.
- **Toxicity scoring implementation** — for v1, stub it or use a basic keyword list. Real toxicity scoring requires ML models. Flag it as "basic" in docs and plan for integration with dedicated content safety APIs.

## Naming & Branding

- Package name: `@brivora/verify`
- License: AGPL-3.0-or-later
- Author: Brivora, LLC
- Repository: github.com/brivorai/verify (when published)

## Ship Criteria

- [ ] Core govern() → check() flow working with tests
- [ ] Merkle tree proof generation + verification
- [ ] Proof chaining (previous_proof linking)
- [ ] EU AI Act v1 governance pack with all rules
- [ ] Fidelity scoring engine
- [ ] Compliance report generation
- [ ] File-based audit store
- [ ] README with 5-line quick start
- [ ] All tests passing, high coverage on proof/verify paths
- [ ] Performance: <50ms governance overhead

## Context Links

- **Brivora vault:** `D:\brivora\`
- **Brivora memory:** `D:\brivora\Reference\CLAUDE_MEMORY.md`
- **Product spec:** `D:\brivora\Products\Verify\Overview.md`
- **Crypto spec:** `D:\brivora\Products\Crypto\Overview.md`
- **Crypto workspace:** `D:\brivora-crypto\` (dependency — must be built first or published to npm)
- **EU AI Act Article 12 blog post:** `D:\brivora\Launch\Blog Posts\02-eu-ai-act-article-12.md` (context on what Article 12 requires)
- **Existing substrate codebase:** `C:\Users\Oscar\Desktop\local_ai_os\` (reference for governance engine patterns — has 4-tier governance, 21 constitutional models, fidelity scoring)
- **Strategic workspace:** `D:\opus4.6\` (reference only)

---

*Builder context for @brivora/verify | Updated 2026-02-13*
