/**
 * @brivora/verify — Fidelity scoring engine
 *
 * Computes weighted composite scores across governance dimensions.
 * @module
 */

import type { FidelityScore, RuleResult, ScoringConfig } from './types.js';

/**
 * Compute the fidelity score from rule results and scoring configuration.
 *
 * Each dimension's score is the fraction of its contributing rules that passed.
 * The overall score is a weighted sum of dimension scores.
 */
export function computeFidelityScore(
	ruleResults: RuleResult[],
	scoring: ScoringConfig,
): FidelityScore {
	const dimensions: Record<string, number> = {};

	for (const dim of scoring.dimensions) {
		const dimResults = ruleResults.filter(
			(r) => dim.rules.includes(r.rule_id) && r.result !== 'SKIP',
		);

		if (dimResults.length === 0) {
			// No applicable rules → full score for this dimension
			dimensions[dim.name] = 1.0;
			continue;
		}

		const passed = dimResults.filter((r) => r.result === 'PASS').length;
		dimensions[dim.name] = passed / dimResults.length;
	}

	// Compute weighted overall score
	let overall = 0;
	let totalWeight = 0;

	for (const dim of scoring.dimensions) {
		const weight = scoring.weights[dim.name] ?? 0;
		const dimScore = dimensions[dim.name] ?? 1.0;
		overall += dimScore * weight;
		totalWeight += weight;
	}

	// Normalize if weights don't sum to 1.0
	if (totalWeight > 0 && totalWeight !== 1.0) {
		overall = overall / totalWeight;
	}

	// Clamp to [0, 1]
	overall = Math.max(0, Math.min(1, overall));

	return {
		overall,
		dimensions,
		threshold: scoring.threshold,
		passed: overall >= scoring.threshold,
	};
}
