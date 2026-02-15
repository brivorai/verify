/**
 * @brivora/verify — Governance pack loading and validation
 *
 * Governance packs are data-driven rule definitions. No executable code.
 * @module
 */

import { readFile } from 'node:fs/promises';
import { builtinPacks } from './packs/index.js';
import type { GovernancePack, PackDefinition } from './types.js';

/**
 * Load a built-in governance pack by name.
 */
export function loadPack(name: string): GovernancePack {
	const pack = builtinPacks.get(name);
	if (!pack) {
		const available = listPacks().join(', ');
		throw new Error(`Unknown governance pack: "${name}". Available packs: ${available}`);
	}
	return pack;
}

/**
 * Load a governance pack from a JSON file.
 */
export async function loadPackFromFile(path: string): Promise<GovernancePack> {
	const content = await readFile(path, 'utf-8');
	const raw = JSON.parse(content) as PackDefinition;
	return createPack(raw);
}

/**
 * Create a governance pack from a programmatic definition.
 */
export function createPack(definition: PackDefinition): GovernancePack {
	validatePackDefinition(definition);

	return {
		name: definition.name,
		version: definition.version,
		description: definition.description,
		rules: definition.rules,
		scoring: definition.scoring,
		metadata: definition.metadata ?? {},
	};
}

/**
 * List all available built-in pack names.
 */
export function listPacks(): string[] {
	return Array.from(builtinPacks.keys());
}

/**
 * Validate a pack definition for correctness.
 */
function validatePackDefinition(def: PackDefinition): void {
	if (!def.name || typeof def.name !== 'string') {
		throw new Error('Pack definition must have a name');
	}
	if (!def.version || typeof def.version !== 'string') {
		throw new Error('Pack definition must have a version');
	}
	if (!Array.isArray(def.rules) || def.rules.length === 0) {
		throw new Error('Pack definition must have at least one rule');
	}

	// Validate each rule
	const ruleIds = new Set<string>();
	for (const rule of def.rules) {
		if (!rule.id) throw new Error('Each rule must have an id');
		if (!rule.name) throw new Error(`Rule "${rule.id}" must have a name`);
		if (!rule.evaluate) throw new Error(`Rule "${rule.id}" must have an evaluate config`);
		if (!['pre', 'post', 'both'].includes(rule.phase)) {
			throw new Error(`Rule "${rule.id}" must have a phase of "pre", "post", or "both"`);
		}
		if (!['critical', 'high', 'medium', 'low'].includes(rule.severity)) {
			throw new Error(`Rule "${rule.id}" must have a valid severity`);
		}
		if (ruleIds.has(rule.id)) {
			throw new Error(`Duplicate rule id: "${rule.id}"`);
		}
		ruleIds.add(rule.id);
	}

	// Validate scoring config
	if (!def.scoring) {
		throw new Error('Pack definition must have a scoring config');
	}
	if (
		typeof def.scoring.threshold !== 'number' ||
		def.scoring.threshold < 0 ||
		def.scoring.threshold > 1
	) {
		throw new Error('Scoring threshold must be a number between 0 and 1');
	}
	if (!Array.isArray(def.scoring.dimensions)) {
		throw new Error('Scoring config must have dimensions array');
	}

	// Validate dimension rules reference actual rule IDs
	for (const dim of def.scoring.dimensions) {
		for (const ruleId of dim.rules) {
			if (!ruleIds.has(ruleId)) {
				throw new Error(`Scoring dimension "${dim.name}" references unknown rule: "${ruleId}"`);
			}
		}
	}
}
