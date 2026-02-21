/**
 * ISO/IEC 27001:2022 AI Security Controls Governance Pack
 *
 * Maps ISO/IEC 27001:2022 information security management system
 * (ISMS) controls to AI-specific security concerns. ISO 27001 is
 * not AI-specific but its Annex A controls (derived from ISO 27002)
 * apply directly to AI system security, data protection, access
 * control, incident management, and supply chain security.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const iso27001Ai: GovernancePack = {
	name: 'iso-27001-ai',
	version: '1.0.0',
	description:
		'ISO/IEC 27001:2022 AI security compliance pack. Maps ISMS controls to AI systems: access control for AI models and training data (A.5/A.8), data classification for AI assets (A.5.12-13), cryptographic integrity for models (A.8.24), incident management for AI failures (A.5.24-26), supply chain security for AI components (A.5.19-22), change management for model updates (A.8.32), and logging/monitoring (A.8.15-16).',
	rules: [
		{
			id: 'iso27001-ai-access-control',
			name: 'AI System Access Control',
			description:
				'Verify access controls for AI models, training data, and inference systems per Annex A.8.3 (access restriction) and A.8.5 (secure authentication). AI model weights and training data are high-value assets.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'access_controls_implemented',
					'authentication_required',
					'least_privilege_applied',
				],
			},
		},
		{
			id: 'iso27001-ai-asset-classification',
			name: 'AI Asset Classification and Handling',
			description:
				'Verify AI assets (models, training data, inference pipelines) are classified and handled per Annex A.5.12 (classification) and A.5.13 (labeling). Classification determines protection level.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_assets_classified', 'classification_level', 'handling_procedures'],
			},
		},
		{
			id: 'iso27001-ai-risk-assessment',
			name: 'AI-Specific Risk Assessment',
			description:
				'Verify information security risk assessment includes AI-specific threats per Clause 6.1 and 8.2. Must cover adversarial attacks, model poisoning, data exfiltration, and prompt injection.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['risk_assessment_includes_ai', 'ai_threats_identified', 'risk_treatment_plan'],
			},
		},
		{
			id: 'iso27001-ai-data-protection',
			name: 'Training Data Protection',
			description:
				'Verify protection of AI training data per Annex A.8.10 (data deletion), A.8.11 (data masking), and A.8.12 (data leakage prevention). Training data may contain sensitive information.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['training_data_protected', 'data_leakage_prevention', 'data_masking_applied'],
			},
		},
		{
			id: 'iso27001-ai-model-integrity',
			name: 'AI Model Integrity',
			description:
				'Verify cryptographic controls protect model integrity per Annex A.8.24 (cryptography). Model weights and configurations must be integrity-verified.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['model_integrity_verified', 'cryptographic_controls'],
			},
		},
		{
			id: 'iso27001-ai-change-management',
			name: 'AI Model Change Management',
			description:
				'Verify change management processes for AI model updates per Annex A.8.32 (change management). Model retraining, fine-tuning, and updates require controlled processes.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['change_management_process', 'model_versioning', 'rollback_capability'],
			},
		},
		{
			id: 'iso27001-ai-supply-chain',
			name: 'AI Supply Chain Security',
			description:
				'Verify supply chain security for AI components per Annex A.5.19-22 (supplier relationships). Third-party models, APIs, and data sources must be assessed.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['supplier_assessment_completed', 'third_party_ai_risks_assessed'],
			},
		},
		{
			id: 'iso27001-ai-incident-management',
			name: 'AI Incident Management',
			description:
				'Verify incident management procedures cover AI-specific incidents per Annex A.5.24-26 (incident management). Must include model failures, adversarial attacks, and data breaches.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_incident_procedures', 'incident_classification', 'response_plan'],
			},
		},
		{
			id: 'iso27001-ai-logging-monitoring',
			name: 'AI System Logging and Monitoring',
			description:
				'Verify logging and monitoring for AI systems per Annex A.8.15 (logging) and A.8.16 (monitoring). Must capture AI decisions, access patterns, and anomalies.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['logging_enabled', 'monitoring_active', 'anomaly_detection'],
			},
		},
		{
			id: 'iso27001-ai-pii-protection',
			name: 'Personal Data in AI Systems',
			description:
				'Detect PII in AI inputs per Annex A.5.34 (privacy and PII protection). Supports ISO 27701 privacy extension alignment.',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'iso27001-ai-audit-trail',
			name: 'ISMS Audit Trail',
			description:
				'Maintain audit records for AI operations per Clause 9.2 (internal audit) and Annex A.8.15 (logging) to support certification evidence',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'evaluation_result',
					'score',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'access_security',
				rules: [
					'iso27001-ai-access-control',
					'iso27001-ai-asset-classification',
					'iso27001-ai-model-integrity',
				],
			},
			{
				name: 'risk_management',
				rules: ['iso27001-ai-risk-assessment', 'iso27001-ai-supply-chain'],
			},
			{
				name: 'data_protection',
				rules: ['iso27001-ai-data-protection', 'iso27001-ai-pii-protection'],
			},
			{
				name: 'operational_security',
				rules: [
					'iso27001-ai-change-management',
					'iso27001-ai-incident-management',
					'iso27001-ai-logging-monitoring',
					'iso27001-ai-audit-trail',
				],
			},
		],
		threshold: 0.8,
		weights: {
			access_security: 0.3,
			risk_management: 0.25,
			data_protection: 0.2,
			operational_security: 0.25,
		},
	},
	metadata: {
		regulation: 'ISO/IEC 27001:2022 Applied to AI Systems',
		standard: 'ISO/IEC 27001:2022',
		companion_standard: 'ISO/IEC 27002:2022 (control implementation guidance)',
		jurisdiction: 'International',
		effective_date: '2022-10-25',
		status: 'voluntary',
		publisher: 'ISO/IEC JTC 1/SC 27',
		certification_cycle: '3-year certification with annual surveillance audits',
		scope: 'AI systems within the scope of an ISMS',
		related_standards:
			'ISO 42001, ISO 27701 (privacy), ISO 27017 (cloud), ISO 27018 (PII in cloud)',
		note: 'ISO 27001 is not AI-specific. This pack maps existing controls to AI security concerns.',
	},
};
