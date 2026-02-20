/**
 * SOC 2 AI Controls Governance Pack
 *
 * Enforces Trust Services Criteria controls for AI systems across
 * Security (CC6, CC7, CC8, CC9), Processing Integrity (PI1),
 * Confidentiality (C1), and Privacy (P1-P8). Designed for continuous
 * verification to generate Type II operational effectiveness evidence.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const soc2Ai: GovernancePack = {
	name: 'soc2-ai',
	version: '1.0.0',
	description:
		'SOC 2 Type II AI Controls Governance Pack. Enforces Trust Services Criteria controls for AI systems across Security (CC6, CC7, CC8, CC9), Processing Integrity (PI1), Confidentiality (C1), and Privacy (P1-P8). Based on AICPA TSC (2017, revised 2022) with AI-specific control mappings.',
	rules: [
		{
			id: 'soc2-ai-001',
			name: 'Model Access Authorization',
			description:
				'Restricts AI model invocation to approved models per CC6.1 and CC6.3 logical access controls',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'model_allowlist',
				models: [],
			},
		},
		{
			id: 'soc2-ai-002',
			name: 'Input Completeness Validation',
			description:
				'Validates input completeness and format before AI processing per PI1.2 input controls',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'length',
				field: 'input',
				min: 1,
				max: 1000000,
			},
		},
		{
			id: 'soc2-ai-003',
			name: 'PII Detection — Inputs',
			description:
				'Scans inputs for PII to protect privacy and confidentiality per P7, C1.1, CC6.7',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'soc2-ai-004',
			name: 'PII Detection — Outputs',
			description: 'Scans outputs for PII to prevent data leakage per PI1.4, P7, P6',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'pii_detection',
				fields: ['response'],
				action: 'flag',
			},
		},
		{
			id: 'soc2-ai-005',
			name: 'Resource Consumption Limits',
			description: 'Enforces token limits to prevent resource exhaustion per CC5.1 and A1.1',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'token_limit',
				max_input: 100000,
			},
		},
		{
			id: 'soc2-ai-006',
			name: 'Output Safety Screening',
			description: 'Screens outputs for harmful content per PI1.4, CC4.1, CC7.2',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.7,
			},
		},
		{
			id: 'soc2-ai-007',
			name: 'Bias and Fairness Monitoring',
			description: 'Monitors outputs for systematic bias per PI1.3, PI1.4, CC3.2',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'race',
					'gender',
					'age',
					'disability',
					'religion',
					'national_origin',
				],
			},
		},
		{
			id: 'soc2-ai-008',
			name: 'Complete Audit Trail',
			description:
				'Ensures every invocation generates a complete audit record per CC7.2, PI1.3, PI1.5, CC4.1',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'model_version',
					'input_hash',
					'output_hash',
					'token_count',
					'latency_ms',
					'rules_evaluated',
					'score',
				],
			},
		},
		{
			id: 'soc2-ai-009',
			name: 'Model Version Tracking',
			description: 'Requires model version identification per CC8.1 change management and PI1.3',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['model', 'model_version'],
			},
		},
		{
			id: 'soc2-ai-010',
			name: 'Third-Party Vendor Governance',
			description:
				'Validates vendor governance metadata for third-party AI providers per CC9.2, CC6.6',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'contains',
				field: 'vendor_config',
				values: ['enterprise_agreement', 'training_opt_out', 'data_processing_agreement'],
			},
		},
		{
			id: 'soc2-ai-011',
			name: 'Data Encryption Verification',
			description: 'Verifies encryption for AI data in transit and at rest per CC6.1, C1.1, CC6.6',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['transport_encryption', 'storage_encryption'],
			},
		},
		{
			id: 'soc2-ai-012',
			name: 'AI Incident Detection',
			description: 'Evaluates invocations against incident thresholds per CC7.2, CC7.3, CC7.4',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'custom',
				fn: 'incident_detection',
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'access_control',
				rules: ['soc2-ai-001', 'soc2-ai-009', 'soc2-ai-011'],
			},
			{
				name: 'processing_integrity',
				rules: ['soc2-ai-002', 'soc2-ai-006', 'soc2-ai-008'],
			},
			{
				name: 'data_protection',
				rules: ['soc2-ai-003', 'soc2-ai-004', 'soc2-ai-011'],
			},
			{
				name: 'operational_monitoring',
				rules: [
					'soc2-ai-005',
					'soc2-ai-007',
					'soc2-ai-008',
					'soc2-ai-009',
					'soc2-ai-010',
					'soc2-ai-012',
				],
			},
		],
		threshold: 0.8,
		weights: {
			access_control: 0.25,
			processing_integrity: 0.25,
			data_protection: 0.25,
			operational_monitoring: 0.25,
		},
	},
	metadata: {
		framework: 'AICPA SOC 2 Trust Services Criteria (2017, revised 2022)',
		target: 'Type II (Operational Effectiveness)',
		tsc_coverage: ['CC3', 'CC4', 'CC5', 'CC6', 'CC7', 'CC8', 'CC9', 'A1', 'PI1', 'C1', 'P6', 'P7'],
	},
};
