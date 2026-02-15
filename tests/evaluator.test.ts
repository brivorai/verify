import { describe, it, expect } from 'vitest';
import { evaluateRule, evaluateRules, registerCustomEvaluator } from '../src/evaluator.js';
import type { GovernanceRule, EvalContext } from '../src/types.js';

function makeCtx(overrides: Partial<EvalContext> = {}): EvalContext {
	return {
		prompt: 'Test prompt',
		model: 'claude-opus-4-6',
		parameters: { temperature: 0.7 },
		response: 'Test response',
		ruleResults: [],
		...overrides,
	};
}

function makeRule(overrides: Partial<GovernanceRule>): GovernanceRule {
	return {
		id: 'test-rule',
		name: 'Test Rule',
		description: 'A test rule',
		phase: 'both',
		severity: 'high',
		evaluate: { type: 'required', fields: ['prompt'] },
		...overrides,
	};
}

describe('evaluator', () => {
	describe('required', () => {
		it('passes when all required fields are present', () => {
			const rule = makeRule({
				evaluate: { type: 'required', fields: ['prompt', 'model'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails when a required field is missing', () => {
			const rule = makeRule({
				evaluate: { type: 'required', fields: ['prompt', 'model', 'nonexistent'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
			expect(result.message).toContain('nonexistent');
		});

		it('fails when a required field is empty string', () => {
			const rule = makeRule({
				evaluate: { type: 'required', fields: ['prompt'] },
			});
			const result = evaluateRule(rule, makeCtx({ prompt: '' }), 'pre');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('contains', () => {
		it('passes when field contains expected value', () => {
			const rule = makeRule({
				evaluate: { type: 'contains', field: 'prompt', values: ['Test'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails when field does not contain expected value', () => {
			const rule = makeRule({
				evaluate: { type: 'contains', field: 'prompt', values: ['nonexistent'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});

		it('supports negate mode', () => {
			const rule = makeRule({
				evaluate: { type: 'contains', field: 'prompt', values: ['badword'], negate: true },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});
	});

	describe('regex', () => {
		it('passes when field matches pattern', () => {
			const rule = makeRule({
				evaluate: { type: 'regex', field: 'prompt', pattern: '^Test' },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails when field does not match pattern', () => {
			const rule = makeRule({
				evaluate: { type: 'regex', field: 'prompt', pattern: '^Hello' },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});

		it('supports negate mode', () => {
			const rule = makeRule({
				evaluate: { type: 'regex', field: 'prompt', pattern: '^Hello', negate: true },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});
	});

	describe('length', () => {
		it('passes when length is within bounds', () => {
			const rule = makeRule({
				evaluate: { type: 'length', field: 'prompt', min: 1, max: 100 },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails when length exceeds max', () => {
			const rule = makeRule({
				evaluate: { type: 'length', field: 'prompt', max: 3 },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});

		it('fails when length is below min', () => {
			const rule = makeRule({
				evaluate: { type: 'length', field: 'prompt', min: 1000 },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('model_allowlist', () => {
		it('passes when model is in allowlist', () => {
			const rule = makeRule({
				evaluate: { type: 'model_allowlist', models: ['claude-opus-4-6', 'gpt-4'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails when model is not in allowlist', () => {
			const rule = makeRule({
				evaluate: { type: 'model_allowlist', models: ['gpt-4'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('model_blocklist', () => {
		it('passes when model is not in blocklist', () => {
			const rule = makeRule({
				evaluate: { type: 'model_blocklist', models: ['dangerous-model'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails when model is in blocklist', () => {
			const rule = makeRule({
				evaluate: { type: 'model_blocklist', models: ['claude-opus-4-6'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('token_limit', () => {
		it('passes when within token limits', () => {
			const rule = makeRule({
				evaluate: { type: 'token_limit', max_input: 1000, max_output: 1000 },
			});
			const result = evaluateRule(rule, makeCtx(), 'post');
			expect(result.result).toBe('PASS');
		});

		it('fails when exceeding input token limit', () => {
			const rule = makeRule({
				evaluate: { type: 'token_limit', max_input: 1 },
			});
			const result = evaluateRule(rule, makeCtx(), 'post');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('pii_detection', () => {
		it('passes when no PII detected', () => {
			const rule = makeRule({
				evaluate: { type: 'pii_detection', fields: ['prompt'], action: 'flag' },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('flags PII (email) but passes in flag mode', () => {
			const rule = makeRule({
				evaluate: { type: 'pii_detection', fields: ['prompt'], action: 'flag' },
			});
			const ctx = makeCtx({ prompt: 'Contact user@example.com for details' });
			const result = evaluateRule(rule, ctx, 'pre');
			expect(result.result).toBe('PASS');
			expect(result.message).toContain('flagged');
		});

		it('blocks PII (SSN) in block mode', () => {
			const rule = makeRule({
				evaluate: { type: 'pii_detection', fields: ['prompt'], action: 'block' },
			});
			const ctx = makeCtx({ prompt: 'SSN: 123-45-6789' });
			const result = evaluateRule(rule, ctx, 'pre');
			expect(result.result).toBe('FAIL');
		});

		it('detects phone numbers', () => {
			const rule = makeRule({
				evaluate: { type: 'pii_detection', fields: ['prompt'], action: 'block' },
			});
			const ctx = makeCtx({ prompt: 'Call me at (555) 123-4567' });
			const result = evaluateRule(rule, ctx, 'pre');
			expect(result.result).toBe('FAIL');
		});

		it('detects credit card numbers', () => {
			const rule = makeRule({
				evaluate: { type: 'pii_detection', fields: ['prompt'], action: 'block' },
			});
			const ctx = makeCtx({ prompt: 'Card: 4111-1111-1111-1111' });
			const result = evaluateRule(rule, ctx, 'pre');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('toxicity_threshold', () => {
		it('passes for clean text', () => {
			const rule = makeRule({
				evaluate: { type: 'toxicity_threshold', max_score: 0.8 },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});

		it('fails for text with many toxic keywords', () => {
			const rule = makeRule({
				evaluate: { type: 'toxicity_threshold', max_score: 0.01 },
			});
			const ctx = makeCtx({ prompt: 'kill destroy attack bomb weapon' });
			const result = evaluateRule(rule, ctx, 'pre');
			expect(result.result).toBe('FAIL');
		});
	});

	describe('bias_detection', () => {
		it('passes and flags when protected attributes are mentioned', () => {
			const rule = makeRule({
				evaluate: { type: 'bias_detection', protected_attributes: ['gender', 'race'] },
			});
			const ctx = makeCtx({ prompt: 'Analyze this by gender' });
			const result = evaluateRule(rule, ctx, 'pre');
			expect(result.result).toBe('PASS'); // Flag only, not fail
			expect(result.message).toContain('gender');
		});

		it('passes when no protected attributes detected', () => {
			const rule = makeRule({
				evaluate: { type: 'bias_detection', protected_attributes: ['gender', 'race'] },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});
	});

	describe('custom', () => {
		it('fails when custom function is not registered', () => {
			const rule = makeRule({
				evaluate: { type: 'custom', fn: 'nonexistent' },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('FAIL');
		});

		it('calls registered custom function', () => {
			registerCustomEvaluator('test-custom', (ctx) => ({
				rule_id: 'custom-test',
				rule_name: 'Custom Test',
				severity: 'low',
				result: ctx.prompt === 'Test prompt' ? 'PASS' : 'FAIL',
			}));

			const rule = makeRule({
				evaluate: { type: 'custom', fn: 'test-custom' },
			});
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('PASS');
		});
	});

	describe('phase filtering', () => {
		it('skips pre-only rules in post phase', () => {
			const rule = makeRule({ phase: 'pre' });
			const result = evaluateRule(rule, makeCtx(), 'post');
			expect(result.result).toBe('SKIP');
		});

		it('skips post-only rules in pre phase', () => {
			const rule = makeRule({ phase: 'post' });
			const result = evaluateRule(rule, makeCtx(), 'pre');
			expect(result.result).toBe('SKIP');
		});

		it('runs both-phase rules in either phase', () => {
			const rule = makeRule({ phase: 'both' });
			const prResult = evaluateRule(rule, makeCtx(), 'pre');
			const poResult = evaluateRule(rule, makeCtx(), 'post');
			expect(prResult.result).not.toBe('SKIP');
			expect(poResult.result).not.toBe('SKIP');
		});
	});

	describe('evaluateRules', () => {
		it('evaluates all rules and returns results', () => {
			const rules: GovernanceRule[] = [
				makeRule({ id: 'r1', evaluate: { type: 'required', fields: ['prompt'] } }),
				makeRule({ id: 'r2', evaluate: { type: 'required', fields: ['nonexistent'] } }),
			];
			const results = evaluateRules(rules, makeCtx(), 'pre');
			expect(results).toHaveLength(2);
			expect(results[0]!.result).toBe('PASS');
			expect(results[1]!.result).toBe('FAIL');
		});
	});
});
