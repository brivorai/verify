/**
 * HIPAA AI Governance Pack
 *
 * Enforces compliance with HIPAA Privacy Rule, Security Rule, Breach
 * Notification Rule, ACA Section 1557, and ONC HTI-1 for AI systems
 * processing Protected Health Information (PHI) in healthcare settings.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const hipaaAi: GovernancePack = {
	name: 'hipaa-ai',
	version: '1.0.0',
	description:
		'HIPAA AI Governance Pack — Enforces compliance with HIPAA Privacy Rule, Security Rule, Breach Notification Rule, ACA Section 1557, and ONC HTI-1 for AI systems processing Protected Health Information (PHI). Covers PHI detection and blocking, de-identification, minimum necessary enforcement, BAA verification, encryption, audit controls, bias detection, breach notification, and clinical AI transparency.',
	rules: [
		{
			id: 'hipaa-ai-001',
			name: 'PHI Detection — Input Screening',
			description:
				'Screens all AI input prompts for PHI (all 18 Safe Harbor identifiers per §164.514(b)(2)). PHI must be blocked and routed through BAA-covered endpoints, de-identified, or confirmed as authorized under TPO.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'block',
			},
		},
		{
			id: 'hipaa-ai-002',
			name: 'PHI Detection — Output Screening',
			description:
				'Screens AI model responses for PHI before delivery. Prevents PHI leakage from training data memorization, RAG cross-contamination, or context window issues per §164.502(a) and §164.514(a).',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'pii_detection',
				fields: ['response'],
				action: 'block',
			},
		},
		{
			id: 'hipaa-ai-003',
			name: 'Minimum Necessary Standard — Data Scope Limitation',
			description:
				'Enforces the HIPAA minimum necessary standard per §164.502(b) by requiring AI functions to declare minimum data requirements and validating prompt content against declared purpose.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'custom',
				fn: 'minimum_necessary_scope',
			},
		},
		{
			id: 'hipaa-ai-004',
			name: 'BAA Verification — AI Vendor Compliance',
			description:
				'Verifies external AI model endpoints receiving PHI are covered by a valid Business Associate Agreement per §164.502(e) and §164.504(e). Blocks PHI transmission to non-BAA endpoints.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['baa_verified', 'baa_expiry_date'],
			},
		},
		{
			id: 'hipaa-ai-005',
			name: 'Encryption — ePHI at Rest and in Transit',
			description:
				'Validates all ePHI processed by AI systems is encrypted at rest (AES-256) and in transit (TLS 1.2+) per §164.312(a)(2)(iv) and §164.312(e)(2)(ii).',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['transport_encryption', 'storage_encryption'],
			},
		},
		{
			id: 'hipaa-ai-006',
			name: 'Audit Controls — AI Activity Logging',
			description:
				'Generates comprehensive, tamper-evident audit logs for all AI system activity involving ePHI per §164.312(b). Logs retained minimum 6 years per §164.530(j).',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'user_id',
					'model',
					'model_version',
					'input_hash',
					'output_hash',
					'phi_categories_accessed',
					'authorization_basis',
					'latency_ms',
				],
			},
		},
		{
			id: 'hipaa-ai-007',
			name: 'Model Access Control — Approved Models Only',
			description:
				'Restricts AI operations involving PHI to pre-approved models validated for HIPAA compliance, covered by BAA, and assessed for bias/safety per §164.312(a)(1).',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'model_allowlist',
				models: [],
			},
		},
		{
			id: 'hipaa-ai-008',
			name: 'Non-Discrimination — Clinical AI Bias Detection',
			description:
				'Screens AI outputs for discriminatory bias in clinical decisions per ACA Section 1557 (42 U.S.C. 18116), 45 CFR Part 92, and ONC HTI-1 FAVES Framework.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'race',
					'color',
					'national_origin',
					'sex',
					'gender_identity',
					'age',
					'disability',
					'language',
				],
			},
		},
		{
			id: 'hipaa-ai-009',
			name: 'Integrity Controls — AI Output Verification',
			description:
				'Ensures AI-generated content destined for medical records is integrity-protected with checksums, digital signatures, and model version verification per §164.312(c).',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'required',
				fields: ['output_hash', 'model', 'model_version', 'timestamp', 'input_hash'],
			},
		},
		{
			id: 'hipaa-ai-010',
			name: 'Breach Detection — PHI Exposure Monitoring',
			description:
				'Monitors AI activity for potential breaches of unsecured PHI including cross-patient data exposure, model memorization leakage, and RAG errors per §164.400-414.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'custom',
				fn: 'breach_detection',
			},
		},
		{
			id: 'hipaa-ai-011',
			name: 'Data Exposure Limitation — Token and Context Limits',
			description:
				'Enforces token limits to minimize PHI volume exposed to AI models per §164.502(b) minimum necessary standard and §164.308(a)(1) risk analysis.',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'token_limit',
				max_input: 8192,
			},
		},
		{
			id: 'hipaa-ai-012',
			name: 'Transparency — AI Output Provenance and Source Attribution',
			description:
				'Ensures AI-generated clinical content includes provenance metadata per ONC HTI-1 source attribute requirements for Predictive DSIs and the FAVES framework.',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'required',
				fields: [
					'ai_generated_flag',
					'model',
					'model_version',
					'timestamp',
					'confidence_score',
					'human_review_required',
				],
			},
		},
		{
			id: 'hipaa-ai-013',
			name: 'Authorization Check — Patient Consent for AI Processing',
			description:
				'Verifies valid patient authorization exists when PHI is used beyond TPO (treatment, payment, healthcare operations) per §164.508, particularly for AI model training and research.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'custom',
				fn: 'patient_authorization',
			},
		},
		{
			id: 'hipaa-ai-014',
			name: 'Risk Analysis — AI System Vulnerability Assessment',
			description:
				'Validates current, comprehensive risk analysis covering AI-specific threats (model memorization, prompt injection, data poisoning, PHI leakage) per §164.308(a)(1)(ii)(A).',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['risk_analysis_id', 'risk_analysis_date', 'ai_threat_categories_assessed'],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'phi_protection',
				rules: ['hipaa-ai-001', 'hipaa-ai-002', 'hipaa-ai-011'],
			},
			{
				name: 'access_and_authorization',
				rules: ['hipaa-ai-003', 'hipaa-ai-004', 'hipaa-ai-007', 'hipaa-ai-013'],
			},
			{
				name: 'security_controls',
				rules: ['hipaa-ai-005', 'hipaa-ai-009', 'hipaa-ai-014'],
			},
			{
				name: 'audit_and_accountability',
				rules: ['hipaa-ai-006'],
			},
			{
				name: 'nondiscrimination',
				rules: ['hipaa-ai-008'],
			},
			{
				name: 'transparency_and_provenance',
				rules: ['hipaa-ai-010', 'hipaa-ai-012'],
			},
		],
		threshold: 0.9,
		weights: {
			phi_protection: 0.25,
			access_and_authorization: 0.2,
			security_controls: 0.2,
			audit_and_accountability: 0.15,
			nondiscrimination: 0.1,
			transparency_and_provenance: 0.1,
		},
	},
	metadata: {
		regulation: 'HIPAA (Health Insurance Portability and Accountability Act)',
		citations: [
			'45 CFR Part 164 Subpart C (Security Rule)',
			'45 CFR Part 164 Subpart D (Breach Notification Rule)',
			'45 CFR Part 164 Subpart E (Privacy Rule)',
			'42 U.S.C. 18116 (ACA Section 1557)',
			'ONC HTI-1 Final Rule (DSI Certification)',
		],
		jurisdiction: 'US',
		sector: 'healthcare',
		enforcement: 'HHS Office for Civil Rights (OCR)',
		penalty_max: '$2,190,294 per violation (willful neglect)',
		criminal_penalty_max: '$250,000 and 10 years imprisonment',
		critical_rules: [
			'hipaa-ai-001',
			'hipaa-ai-002',
			'hipaa-ai-004',
			'hipaa-ai-005',
			'hipaa-ai-010',
		],
		last_updated: '2026-02-18',
	},
};
