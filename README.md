# @brivora/verify

**5 lines of code to make any AI call verifiable.**

Wrap any AI API call with governance rules and get a cryptographic proof of compliance. PQC-signed Merkle root. Independently verifiable by anyone. No API call. No account. Pure math.

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

## Install

```bash
npm install @brivora/verify
# or
pnpm add @brivora/verify
```

## How It Works

Every AI call flows through a 5-stage governance pipeline:

```
DEFINE → OBSERVE/PRE-EVALUATE → EXECUTE → POST-EVALUATE → PROVE
```

1. **DEFINE** — Load governance rules from a pack (EU AI Act, HIPAA, custom)
2. **OBSERVE + PRE-EVALUATE** — Capture prompt/model, run pre-call rules, circuit-break if critical failure
3. **EXECUTE** — Call your AI function, capture response and timing
4. **POST-EVALUATE** — Run post-call rules, compute fidelity score
5. **PROVE** — Build Merkle tree from all events, sign root with ML-DSA-65 + Ed25519

The result includes a `BrivoraProof` — a self-contained cryptographic proof that anyone can verify with just the proof and a public key.

## Independent Verification

```typescript
// Anyone can verify — no API, no account, no Brivora dependency
const verified = await verify.check(proof, verifierPublicKey);
console.log(verified.valid); // true or false
```

Verification recomputes the Merkle tree from the evidence chain and verifies the post-quantum signature. If any event was tampered with, the root hash changes and the signature is invalid.

## Governance Packs

Governance packs are data-driven rule definitions — no executable code.

### Built-in Packs

- `eu-ai-act-v1` — EU AI Act Article 12 compliance (7 rules)
- `minimal` — Basic logging for testing

```typescript
// List available packs
const packs = verify.listPacks(); // ['eu-ai-act-v1', 'minimal']

// Load a pack
const pack = verify.loadPack('eu-ai-act-v1');
```

### Custom Packs

```typescript
const customPack = verify.createPack({
  name: 'my-governance',
  version: '1.0.0',
  description: 'Custom governance rules',
  rules: [
    {
      id: 'model-allowlist',
      name: 'Approved models only',
      description: 'Only allow approved AI models',
      phase: 'pre',
      severity: 'critical',
      evaluate: { type: 'model_allowlist', models: ['claude-opus-4-6', 'gpt-4'] },
    },
  ],
  scoring: {
    dimensions: [{ name: 'compliance', rules: ['model-allowlist'] }],
    threshold: 1.0,
    weights: { compliance: 1.0 },
  },
});

const result = await verify.govern(fn, { governance: customPack });
```

### Available Rule Evaluators

| Type | Description |
|------|-------------|
| `required` | Check required fields are present |
| `contains` | Check field contains specific values |
| `regex` | Match field against a regex pattern |
| `length` | Validate field length (min/max) |
| `model_allowlist` | Only allow specific models |
| `model_blocklist` | Block specific models |
| `token_limit` | Enforce input/output token limits |
| `pii_detection` | Detect PII (SSN, email, phone, credit card) |
| `toxicity_threshold` | Basic toxicity keyword scoring |
| `bias_detection` | Flag protected attribute mentions |
| `custom` | Named function from registry |

## Proof Chaining

Link sequential proofs together for a tamper-evident audit trail:

```typescript
const verifier = await verify.createVerifier();
const chain = verify.createChain(verifier);

// Each call adds to the chain
const r1 = await verify.govern(fn1, { governance: 'minimal', verifier, chain });
const r2 = await verify.govern(fn2, { governance: 'minimal', verifier, chain });

// Verify the entire chain
const chainResult = await verify.checkChain([r1.proof, r2.proof], verifier.publicKey);
console.log(chainResult.valid);           // true
console.log(chainResult.chain_integrity); // true
```

## Audit Store

Persist proofs for later retrieval:

```typescript
// In-memory store
const store = verify.createAuditStore({ type: 'memory' });

// File-based store
const store = verify.createAuditStore({ type: 'file', path: './audit' });

// Save and retrieve
await store.save(result.proof);
const proofs = await store.list();
```

## Verifier Identity

Create a persistent signing identity:

```typescript
const verifier = await verify.createVerifier();

// Use the same verifier for all calls
const result = await verify.govern(fn, {
  governance: 'eu-ai-act-v1',
  verifier,
  metadata: {
    prompt: 'Your prompt here',
    model: 'claude-opus-4-6',
  },
});

// Share the public key for verification
console.log(verifier.fingerprint); // SHA-256 hex fingerprint
```

## Proof Structure

```typescript
interface BrivoraProof {
  version: '1.0';
  timestamp: string;                    // ISO-8601
  subject: string;                      // AI system identifier
  verifier: string;                     // Verifier fingerprint
  governance_policy: ContentHash;       // Hash of governance pack
  fidelity_score: FidelityScore;        // Composite score 0.0-1.0
  evaluation_result: 'PASS' | 'FAIL' | 'PARTIAL';
  evidence_chain: ContentHash[];        // Ordered event hashes (Merkle leaves)
  merkle_root: ContentHash;             // Root of the Merkle tree
  signature: ProofSignature;            // ML-DSA-65 + Ed25519 hybrid
  public_key: Uint8Array;               // For self-contained verification
  previous_proof?: ContentHash;         // Chain link
}
```

## Requirements

- Node.js 20+
- `@brivora/crypto` (PQC signatures and hashing)

## Security

- **Post-quantum signatures** — ML-DSA-65 + Ed25519 hybrid via `@brivora/crypto`
- **SHA-3-256** Merkle tree — tamper-evident event chain
- **No telemetry** — zero analytics, zero phone home
- **No network calls** — beyond your AI function call
- **Governance packs are data** — no executable code in packs

## License

[AGPL-3.0-or-later](./LICENSE) — [Brivora, LLC](https://brivora.dev)
