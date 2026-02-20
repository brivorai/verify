/**
 * NIST AI Risk Management Framework (AI 100-1) Governance Pack
 *
 * Provides automated compliance checks mapped to GOVERN, MAP, MEASURE,
 * and MANAGE functions. Supports Texas TRAIGA safe harbor defense and
 * aligns with OMB M-25-21 minimum risk management practices.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const nistAiRmf: GovernancePack = {
	name: 'nist-ai-rmf',
	version: '1.0.0',
	description:
		'NIST AI Risk Management Framework (AI 100-1) governance pack with GenAI Profile (AI 600-1) extensions. Supports Texas TRAIGA safe harbor defense and aligns with OMB M-25-21 minimum risk management practices for high-impact AI.',
	rules: [
		// ── GOVERN FUNCTION ──────────────────────────────────────────
		{
			id: 'nist-gv-1-governance-policy',
			name: 'AI Governance Policy Documentation',
			description:
				'Verifies that AI governance policies, risk tolerance levels, and regulatory requirements are documented in system metadata (GV-1.1, GV-1.2, GV-1.3)',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['governance_policy_ref', 'risk_tolerance_level', 'regulatory_context'],
			},
		},
		{
			id: 'nist-gv-1-system-inventory',
			name: 'AI System Inventory Registration',
			description:
				'Verifies the AI system is registered in the organizational inventory with a unique identifier, version, and purpose statement (GV-1.6)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_id', 'system_version', 'intended_purpose'],
			},
		},
		{
			id: 'nist-gv-6-model-provenance',
			name: 'Third-Party Model Provenance',
			description:
				'Verifies model provenance and supplier identity for third-party risk tracking (GV-6.1, GV-6.2). Addresses AI 600-1 Value Chain risk.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['model_provider', 'model'],
			},
		},

		// ── MAP FUNCTION ─────────────────────────────────────────────
		{
			id: 'nist-mp-2-model-allowlist',
			name: 'Approved Model Enforcement',
			description:
				'Restricts AI operations to organization-approved models (MP-2.1, MP-4.2, MG-3.1). Critical for Texas TRAIGA safe harbor.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'model_allowlist',
				models: [],
			},
		},
		{
			id: 'nist-mp-1-purpose-documentation',
			name: 'Intended Purpose and Limitations',
			description:
				'Requires intended purpose and known limitations to be documented with sufficient detail (MP-1.1, MP-2.2)',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'length',
				field: 'purpose_statement',
				min: 20,
				max: 2000,
			},
		},

		// ── MEASURE FUNCTION ─────────────────────────────────────────
		{
			id: 'nist-ms-2-10-pii-detection',
			name: 'Privacy Risk Detection (PII)',
			description:
				'Scans AI inputs and outputs for PII to prevent privacy violations (MS-2.10). Addresses AI 600-1 Data Privacy risk.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'nist-ms-2-11-bias-detection',
			name: 'Fairness and Bias Evaluation',
			description:
				'Evaluates AI outputs for harmful bias across protected characteristics (MS-2.11). Addresses AI 600-1 Harmful Bias risk.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'race',
					'gender',
					'age',
					'disability',
					'religion',
					'national_origin',
					'sexual_orientation',
				],
			},
		},
		{
			id: 'nist-ms-2-toxicity',
			name: 'Content Safety and Toxicity Screening',
			description:
				'Screens AI outputs for toxic, harmful, or hateful content (MS-2.6). Addresses AI 600-1 Dangerous Content and Obscene Content risks.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.3,
			},
		},
		{
			id: 'nist-ms-2-12-token-efficiency',
			name: 'Environmental Impact Tracking',
			description:
				'Enforces token limits to track computational resource consumption and environmental impact (MS-2.12). Addresses AI 600-1 Environmental risk.',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'token_limit',
				max_input: 8192,
			},
		},

		// ── MANAGE FUNCTION ──────────────────────────────────────────
		{
			id: 'nist-mg-4-incident-metadata',
			name: 'Incident Response and Monitoring Readiness',
			description:
				'Verifies incident response configuration and monitoring metadata are present (MG-4.1, MG-4.3)',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'required',
				fields: ['monitoring_enabled', 'incident_contact'],
			},
		},
		{
			id: 'nist-ms-2-9-output-explainability',
			name: 'Output Explainability and Context',
			description:
				'Requires AI outputs to include explainability markers or confidence indicators (MS-2.9). Addresses AI 600-1 Confabulation and Human-AI Configuration risks.',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'contains',
				field: 'output_metadata',
				values: ['confidence', 'sources', 'reasoning'],
			},
		},
		{
			id: 'nist-mg-1-risk-classification',
			name: 'Risk Classification and Human Review',
			description:
				'Verifies each AI interaction is classified by risk level with human review flagging (MG-1.1, MG-1.2, MG-2.4)',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['risk_level', 'human_review_required'],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'governance',
				rules: [
					'nist-gv-1-governance-policy',
					'nist-gv-1-system-inventory',
					'nist-gv-6-model-provenance',
				],
			},
			{
				name: 'risk_mapping',
				rules: ['nist-mp-2-model-allowlist', 'nist-mp-1-purpose-documentation'],
			},
			{
				name: 'trustworthiness_measurement',
				rules: [
					'nist-ms-2-10-pii-detection',
					'nist-ms-2-11-bias-detection',
					'nist-ms-2-toxicity',
					'nist-ms-2-12-token-efficiency',
					'nist-ms-2-9-output-explainability',
				],
			},
			{
				name: 'risk_management',
				rules: ['nist-mg-4-incident-metadata', 'nist-mg-1-risk-classification'],
			},
		],
		threshold: 0.75,
		weights: {
			governance: 0.3,
			risk_mapping: 0.2,
			trustworthiness_measurement: 0.3,
			risk_management: 0.2,
		},
	},
	metadata: {
		framework: 'NIST AI 100-1 (AI Risk Management Framework 1.0)',
		genai_profile: 'NIST AI 600-1',
		safe_harbor: 'Texas TRAIGA (effective 2026-01-01)',
		omb_alignment: 'OMB M-25-21',
		last_updated: '2026-02-18',
	},
};
