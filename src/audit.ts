/**
 * @brivora/verify — Audit store implementations
 *
 * Optional persistence for proofs. File-based and in-memory stores.
 * @module
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { hashProof } from './proof.js';
import type { AuditStore, AuditStoreOptions, BrivoraProof, ContentHash } from './types.js';

// ─── In-Memory Store ────────────────────────────────────────────────────────

class MemoryAuditStore implements AuditStore {
	private proofs = new Map<string, BrivoraProof>();
	private ordered: BrivoraProof[] = [];

	async save(proof: BrivoraProof): Promise<void> {
		const hash = hashProof(proof);
		this.proofs.set(hash.value, proof);
		this.ordered.push(proof);
	}

	async load(hash: ContentHash): Promise<BrivoraProof | null> {
		return this.proofs.get(hash.value) ?? null;
	}

	async list(options?: { limit?: number; offset?: number }): Promise<BrivoraProof[]> {
		const offset = options?.offset ?? 0;
		const limit = options?.limit ?? this.ordered.length;
		return this.ordered.slice(offset, offset + limit);
	}

	async chain(options?: { from?: ContentHash }): Promise<BrivoraProof[]> {
		if (!options?.from) {
			return [...this.ordered];
		}

		// Find the starting proof and return all subsequent proofs
		const startIdx = this.ordered.findIndex((p) => {
			const h = hashProof(p);
			return h.value === options.from!.value;
		});

		if (startIdx === -1) return [];
		return this.ordered.slice(startIdx);
	}
}

// ─── File-Based Store ───────────────────────────────────────────────────────

/**
 * Serialize a BrivoraProof to JSON, converting Uint8Arrays to hex.
 */
function serializeProof(proof: BrivoraProof): string {
	return JSON.stringify(
		proof,
		(_key, value) => {
			if (value instanceof Uint8Array) {
				return {
					__uint8array: true,
					hex: Array.from(value)
						.map((b) => b.toString(16).padStart(2, '0'))
						.join(''),
				};
			}
			return value;
		},
		2,
	);
}

/**
 * Deserialize a BrivoraProof from JSON, restoring Uint8Arrays.
 */
function deserializeProof(json: string): BrivoraProof {
	return JSON.parse(json, (_key, value) => {
		if (value && typeof value === 'object' && value.__uint8array && typeof value.hex === 'string') {
			const hex = value.hex as string;
			const bytes = new Uint8Array(hex.length / 2);
			for (let i = 0; i < bytes.length; i++) {
				bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
			}
			return bytes;
		}
		return value;
	}) as BrivoraProof;
}

class FileAuditStore implements AuditStore {
	private dir: string;
	private initialized = false;

	constructor(dir: string) {
		this.dir = dir;
	}

	private async ensureDir(): Promise<void> {
		if (!this.initialized) {
			await mkdir(this.dir, { recursive: true });
			this.initialized = true;
		}
	}

	async save(proof: BrivoraProof): Promise<void> {
		await this.ensureDir();
		const hash = hashProof(proof);
		const filename = `${hash.value}.json`;
		const filepath = join(this.dir, filename);
		await writeFile(filepath, serializeProof(proof), 'utf-8');
	}

	async load(hash: ContentHash): Promise<BrivoraProof | null> {
		await this.ensureDir();
		const filepath = join(this.dir, `${hash.value}.json`);
		try {
			const content = await readFile(filepath, 'utf-8');
			return deserializeProof(content);
		} catch {
			return null;
		}
	}

	async list(options?: { limit?: number; offset?: number }): Promise<BrivoraProof[]> {
		await this.ensureDir();
		const files = await readdir(this.dir);
		const jsonFiles = files.filter((f) => f.endsWith('.json')).sort();

		const offset = options?.offset ?? 0;
		const limit = options?.limit ?? jsonFiles.length;
		const slice = jsonFiles.slice(offset, offset + limit);

		const proofs: BrivoraProof[] = [];
		for (const file of slice) {
			const content = await readFile(join(this.dir, file), 'utf-8');
			proofs.push(deserializeProof(content));
		}
		return proofs;
	}

	async chain(options?: { from?: ContentHash }): Promise<BrivoraProof[]> {
		const all = await this.list();
		if (!options?.from) return all;

		const startIdx = all.findIndex((p) => {
			const h = hashProof(p);
			return h.value === options.from!.value;
		});

		if (startIdx === -1) return [];
		return all.slice(startIdx);
	}
}

// ─── Factory ────────────────────────────────────────────────────────────────

/**
 * Create an audit store for persisting proofs.
 */
export function createAuditStore(options: AuditStoreOptions): AuditStore {
	switch (options.type) {
		case 'memory':
			return new MemoryAuditStore();
		case 'file':
			if (!options.path) {
				throw new Error('File audit store requires a path');
			}
			return new FileAuditStore(options.path);
		case 'custom':
			if (!options.adapter) {
				throw new Error('Custom audit store requires an adapter');
			}
			return options.adapter;
		default:
			throw new Error(`Unknown audit store type: ${options.type as string}`);
	}
}
