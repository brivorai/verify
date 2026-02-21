/**
 * SEC AI Compliance Governance Pack
 *
 * Enforces SEC requirements for AI/ML use by broker-dealers and
 * investment advisers under existing regulatory frameworks. The
 * proposed Predictive Data Analytics rule (S7-12-23) was withdrawn
 * June 2025. This pack maps existing SEC obligations — fiduciary
 * duty, Reg S-P, books and records, advertising — to AI systems.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const secAi: GovernancePack = {
	name: 'sec-ai',
	version: '1.0.0',
	description:
		'SEC AI compliance pack for broker-dealers and investment advisers. Maps existing SEC regulatory frameworks to AI systems: fiduciary duty and best interest obligations, Reg S-P privacy, Reg S-ID identity theft, books and records (17a-4), advertising rules, and conflict of interest management. Note: Proposed PDA rule (S7-12-23) was withdrawn June 2025.',
	rules: [
		{
			id: 'sec-ai-fiduciary-best-interest',
			name: 'Fiduciary Duty and Best Interest',
			description:
				'Verify AI-driven recommendations comply with fiduciary duty (advisers) or Reg BI best interest (broker-dealers). AI must not place firm interests ahead of client interests.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'fiduciary_compliance_documented',
					'conflict_of_interest_assessed',
					'client_interest_prioritized',
				],
			},
		},
		{
			id: 'sec-ai-conflict-identification',
			name: 'AI Conflict of Interest Identification',
			description:
				'Verify identification and management of conflicts of interest when AI is used in investor interactions per existing SEC frameworks',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['conflicts_identified', 'mitigation_measures', 'disclosure_provided'],
			},
		},
		{
			id: 'sec-ai-disclosure-requirements',
			name: 'AI Use Disclosure',
			description:
				'Verify appropriate disclosure of AI use in investment recommendations, client communications, and decision-making processes per SEC disclosure obligations',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_use_disclosed', 'limitations_communicated'],
			},
		},
		{
			id: 'sec-ai-books-records',
			name: 'Books and Records Compliance',
			description:
				'Verify AI-related records are maintained per SEC Rule 17a-4 and Rule 204-2. Must preserve communications, recommendations, and decision rationale.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['records_preserved', 'recommendation_rationale', 'communication_archived'],
			},
		},
		{
			id: 'sec-ai-model-governance',
			name: 'AI Model Governance',
			description:
				'Verify model governance practices for AI systems used in investment decisions per SEC examination priorities and compliance expectations',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['model_governance_policy', 'model_validation', 'change_management'],
			},
		},
		{
			id: 'sec-ai-advertising-compliance',
			name: 'AI in Advertising Compliance',
			description:
				'Verify AI-generated marketing and advertising content complies with SEC Marketing Rule (206(4)-1) — no misleading claims, hypothetical performance rules apply',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'regex',
				field: 'output',
				pattern:
					'(?i)(guaranteed|risk.free|no.risk|certain.to|will.definitely|cannot.lose).{0,50}(return|profit|gain|performance)',
			},
		},
		{
			id: 'sec-ai-suitability-documentation',
			name: 'Suitability and Appropriateness',
			description:
				'Verify AI recommendations are documented with suitability analysis per SEC requirements for investment advice',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['suitability_analysis', 'client_profile_considered'],
			},
		},
		{
			id: 'sec-ai-bias-detection',
			name: 'Fair Treatment Bias Detection',
			description:
				'Monitor AI outputs for patterns that could indicate unfair treatment of investors across demographic groups',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'national_origin'],
			},
		},
		{
			id: 'sec-ai-pii-protection',
			name: 'Reg S-P Privacy Protection',
			description:
				'Detect consumer PII in AI inputs to support Regulation S-P privacy obligations and safeguarding of customer records',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'sec-ai-audit-trail',
			name: 'Regulatory Audit Trail',
			description:
				'Maintain complete audit records for AI-driven investment decisions to support SEC examination, enforcement, and Rule 17a-4 compliance',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'decision_type',
					'evaluation_result',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'investor_protection',
				rules: [
					'sec-ai-fiduciary-best-interest',
					'sec-ai-conflict-identification',
					'sec-ai-suitability-documentation',
					'sec-ai-bias-detection',
				],
			},
			{
				name: 'transparency_disclosure',
				rules: ['sec-ai-disclosure-requirements', 'sec-ai-advertising-compliance'],
			},
			{
				name: 'governance_controls',
				rules: ['sec-ai-model-governance', 'sec-ai-pii-protection'],
			},
			{
				name: 'recordkeeping',
				rules: ['sec-ai-books-records', 'sec-ai-audit-trail'],
			},
		],
		threshold: 0.85,
		weights: {
			investor_protection: 0.35,
			transparency_disclosure: 0.2,
			governance_controls: 0.2,
			recordkeeping: 0.25,
		},
	},
	metadata: {
		regulation: 'SEC Existing Regulatory Frameworks Applied to AI',
		jurisdiction: 'US-SEC',
		effective_date: '2024-01-01',
		status: 'enforceable',
		enforcement: 'Securities and Exchange Commission (SEC)',
		scope: 'Broker-dealers, investment advisers, and registered entities using AI',
		pda_rule_status: 'Proposed rule S7-12-23 withdrawn June 2025',
		key_regulations:
			'Reg BI, Advisers Act Sec 206, Rule 17a-4, Rule 204-2, Reg S-P, Marketing Rule 206(4)-1',
		note: 'Pack maps existing SEC obligations to AI use; no AI-specific SEC rule currently in force',
	},
};
