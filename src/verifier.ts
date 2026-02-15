/**
 * @brivora/verify — Verifier identity management
 *
 * Creates and manages verification engine identities (key pairs for signing proofs).
 * @module
 */

import type { HybridPrivateKey, HybridPublicKey, SignedPayload } from '@brivora/crypto';
import { crypto } from '@brivora/crypto';
import type { Verifier, VerifierOptions } from './types.js';

/**
 * Encode a HybridPublicKey into the length-prefixed byte format
 * used by @brivora/crypto's SignedPayload.publicKey field.
 */
function encodePublicKey(publicKey: HybridPublicKey): Uint8Array {
	const classicalSigning = publicKey.classical.signing;
	const pqcSigning = publicKey.pqc.signing;

	// Length-prefixed format: [4-byte len][classical][4-byte len][pqc]
	const buf = new Uint8Array(4 + classicalSigning.length + 4 + pqcSigning.length);
	const view = new DataView(buf.buffer);

	let offset = 0;
	view.setUint32(offset, classicalSigning.length, false);
	offset += 4;
	buf.set(classicalSigning, offset);
	offset += classicalSigning.length;

	view.setUint32(offset, pqcSigning.length, false);
	offset += 4;
	buf.set(pqcSigning, offset);

	return buf;
}

/**
 * Create a new verifier identity (key pair for signing proofs).
 */
export async function createVerifier(options?: VerifierOptions): Promise<Verifier> {
	let publicKey: HybridPublicKey;
	let privateKey: HybridPrivateKey;
	let fingerprint: string;

	if (options?.existingIdentity) {
		publicKey = options.existingIdentity.publicKey;
		privateKey = options.existingIdentity.privateKey;
		fingerprint = options.existingIdentity.fingerprint;
	} else {
		const identity = await crypto.createIdentity();
		publicKey = identity.publicKey;
		privateKey = identity.privateKey;
		fingerprint = identity.fingerprint;
	}

	const encodedPublicKey = encodePublicKey(publicKey);

	return {
		publicKey,
		privateKey,
		fingerprint,
		encodedPublicKey,
		async sign(data: Uint8Array): Promise<SignedPayload> {
			return crypto.sign(data, privateKey);
		},
	};
}

/**
 * Load a verifier from existing key material.
 */
export async function loadVerifier(
	publicKey: HybridPublicKey,
	privateKey: HybridPrivateKey,
	fingerprint: string,
): Promise<Verifier> {
	return createVerifier({
		existingIdentity: { publicKey, privateKey, fingerprint },
	});
}
