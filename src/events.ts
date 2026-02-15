/**
 * @brivora/verify — Event recording and hashing
 *
 * Creates governance events and computes SHA-3-256 hashes for each.
 * Events are chained via parent_hash for intra-proof ordering.
 * @module
 */

import { crypto } from '@brivora/crypto';
import type { ContentHash, GovernanceEvent, GovernanceEventType } from './types.js';
import { bytesToHex } from './utils.js';

/**
 * Deterministically serialize event data for hashing.
 * Uses JSON with sorted keys for reproducibility.
 */
function serializeEventData(
	type: GovernanceEventType,
	timestamp: string,
	data: Record<string, unknown>,
	parentHash?: ContentHash,
): string {
	const obj: Record<string, unknown> = {
		type,
		timestamp,
		data: sortObject(data),
	};
	if (parentHash) {
		obj.parent_hash = parentHash;
	}
	return JSON.stringify(obj, replacer);
}

/**
 * JSON replacer that handles Uint8Array → hex for deterministic serialization.
 */
function replacer(_key: string, value: unknown): unknown {
	if (value instanceof Uint8Array) {
		return { __type: 'Uint8Array', hex: bytesToHex(value) };
	}
	return value;
}

/**
 * Deep-sort object keys for deterministic JSON output.
 */
function sortObject(obj: unknown): unknown {
	if (obj === null || obj === undefined || typeof obj !== 'object') {
		return obj;
	}
	if (obj instanceof Uint8Array) {
		return obj;
	}
	if (Array.isArray(obj)) {
		return obj.map(sortObject);
	}
	const sorted: Record<string, unknown> = {};
	for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
		sorted[key] = sortObject((obj as Record<string, unknown>)[key]);
	}
	return sorted;
}

/**
 * Compute the SHA-3-256 hash of event data.
 */
function hashEventData(serialized: string): ContentHash {
	const digest = crypto.hash(serialized, 'sha3-256');
	return {
		algorithm: 'sha3-256',
		value: bytesToHex(digest),
	};
}

/**
 * Create a governance event with a computed hash.
 */
export function createEvent(
	type: GovernanceEventType,
	data: Record<string, unknown>,
	parentHash?: ContentHash,
	timestamp?: string,
): GovernanceEvent {
	const ts = timestamp ?? new Date().toISOString();
	const serialized = serializeEventData(type, ts, data, parentHash);
	const hash = hashEventData(serialized);

	return {
		type,
		timestamp: ts,
		hash,
		data,
		parent_hash: parentHash,
	};
}

/**
 * Create a chain of events, each linked to the previous via parent_hash.
 */
export function createEventChain(
	entries: Array<{ type: GovernanceEventType; data: Record<string, unknown> }>,
	timestamp?: string,
): GovernanceEvent[] {
	const events: GovernanceEvent[] = [];
	for (const entry of entries) {
		const parentHash = events.length > 0 ? events[events.length - 1]!.hash : undefined;
		events.push(createEvent(entry.type, entry.data, parentHash, timestamp));
	}
	return events;
}

/**
 * Compute the hash of a governance pack definition (for governance_policy field).
 */
export function hashGovernancePack(pack: {
	name: string;
	version: string;
	rules: Array<{ id: string }>;
}): ContentHash {
	const serialized = JSON.stringify({
		name: pack.name,
		version: pack.version,
		rules: pack.rules.map((r) => r.id).sort(),
	});
	const digest = crypto.hash(serialized, 'sha3-256');
	return {
		algorithm: 'sha3-256',
		value: bytesToHex(digest),
	};
}

/**
 * Compute a system state hash from event data.
 */
export function hashSystemState(data: Record<string, unknown>): ContentHash {
	const serialized = JSON.stringify(sortObject(data), replacer);
	const digest = crypto.hash(serialized, 'sha3-256');
	return {
		algorithm: 'sha3-256',
		value: bytesToHex(digest),
	};
}
