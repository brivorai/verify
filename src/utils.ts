/**
 * @brivora/verify — Internal utilities
 *
 * Hex/bytes conversion and helpers. No external dependencies.
 * @module
 */

export function bytesToHex(bytes: Uint8Array): string {
	let hex = '';
	for (let i = 0; i < bytes.length; i++) {
		hex += (bytes[i] as number).toString(16).padStart(2, '0');
	}
	return hex;
}

export function hexToBytes(hex: string): Uint8Array {
	if (hex.length % 2 !== 0) {
		throw new Error('hexToBytes: invalid hex string length');
	}
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < bytes.length; i++) {
		bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
	let totalLen = 0;
	for (const a of arrays) totalLen += a.length;
	const result = new Uint8Array(totalLen);
	let offset = 0;
	for (const a of arrays) {
		result.set(a, offset);
		offset += a.length;
	}
	return result;
}

export function utf8ToBytes(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}
