/**
 * South Korea AI Basic Act (AI 기본법) Governance Pack
 *
 * Enforces the Framework Act on the Development of Artificial
 * Intelligence and Establishment of Trust, enacted January 21, 2025,
 * effective January 22, 2026. Covers high-impact AI classification,
 * impact assessments, transparency, human oversight, and risk management.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const southKoreaAiBasicAct: GovernancePack = {
	name: 'south-korea-ai-basic-act',
	version: '1.0.0',
	description:
		'South Korea AI Basic Act (인공지능 기본법) compliance pack. Enforces the Framework Act on AI Development and Trust Establishment: high-impact AI classification, mandatory impact assessments, user notification of AI interaction, AI-generated content disclosure, human oversight mechanisms, risk management systems, and training data transparency.',
	rules: [
		{
			id: 'kr-ai-high-impact-classification',
			name: 'High-Impact AI Classification',
			description:
				'Verify AI system risk classification and high-impact determination per the Act. High-impact AI includes systems affecting healthcare, hiring, credit, biometrics, critical infrastructure, and law enforcement.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['ai_risk_classification', 'high_impact_determination', 'use_case_category'],
			},
		},
		{
			id: 'kr-ai-impact-assessment',
			name: 'Mandatory Impact Assessment',
			description:
				'Verify mandatory impact assessment for high-impact AI evaluating effects on fundamental rights, safety, and fairness before deployment',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['impact_assessment_completed', 'rights_impact_evaluated', 'safety_assessment'],
			},
		},
		{
			id: 'kr-ai-user-notification',
			name: 'AI Interaction Notification',
			description:
				'Verify users are notified when interacting with AI and when content is AI-generated per the Act transparency provisions',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['ai_interaction_disclosed', 'ai_content_labeled'],
			},
		},
		{
			id: 'kr-ai-human-oversight',
			name: 'Human Oversight Mechanism',
			description:
				'Verify human oversight mechanisms for high-impact AI with ability to override or intervene in AI decisions',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['human_oversight_mechanism', 'override_capability', 'escalation_procedure'],
			},
		},
		{
			id: 'kr-ai-risk-management',
			name: 'Risk Management System',
			description:
				'Verify risk management system including documentation and incident response procedures per the Act',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['risk_management_system', 'documentation_maintained', 'incident_response_plan'],
			},
		},
		{
			id: 'kr-ai-training-data-transparency',
			name: 'Training Data Transparency',
			description:
				'Verify training data documentation and source disclosure per the Act transparency requirements',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['training_data_documented', 'data_sources_disclosed'],
			},
		},
		{
			id: 'kr-ai-system-documentation',
			name: 'AI System Documentation',
			description:
				'Verify documentation of AI system purpose, capabilities, and known limitations per the Act documentation requirements',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_purpose', 'capabilities_documented', 'known_limitations'],
			},
		},
		{
			id: 'kr-ai-bias-monitoring',
			name: 'Fairness and Bias Monitoring',
			description:
				'Monitor AI outputs for bias and fairness, particularly for high-impact systems affecting fundamental rights',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'national_origin'],
			},
		},
		{
			id: 'kr-ai-content-safety',
			name: 'Content Safety Screening',
			description:
				'Screen AI outputs for harmful content that could affect human safety per the Act safety provisions',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.6,
			},
		},
		{
			id: 'kr-ai-pii-protection',
			name: 'Personal Information Protection',
			description:
				'Detect PII in AI inputs to support compliance with the Act and Korea Personal Information Protection Act (PIPA)',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'kr-ai-audit-trail',
			name: 'Compliance Audit Trail',
			description:
				'Maintain complete audit records for AI operations to support compliance evidence and accountability requirements',
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
				name: 'risk_classification',
				rules: ['kr-ai-high-impact-classification', 'kr-ai-impact-assessment'],
			},
			{
				name: 'transparency',
				rules: [
					'kr-ai-user-notification',
					'kr-ai-training-data-transparency',
					'kr-ai-system-documentation',
				],
			},
			{
				name: 'safety_fairness',
				rules: [
					'kr-ai-bias-monitoring',
					'kr-ai-content-safety',
					'kr-ai-human-oversight',
					'kr-ai-pii-protection',
				],
			},
			{
				name: 'operational_compliance',
				rules: ['kr-ai-risk-management', 'kr-ai-audit-trail'],
			},
		],
		threshold: 0.8,
		weights: {
			risk_classification: 0.25,
			transparency: 0.25,
			safety_fairness: 0.25,
			operational_compliance: 0.25,
		},
	},
	metadata: {
		regulation: 'Framework Act on AI Development and Establishment of Trust (AI Basic Act)',
		statute: 'AI 기본법 (인공지능 기본법)',
		jurisdiction: 'KR',
		effective_date: '2026-01-22',
		status: 'effective',
		enforcement: 'Ministry of Science and ICT (MSIT)',
		penalty_max: 'KRW 30 million (~$20,870 USD)',
		scope: 'AI systems developed, provided, or used in South Korea',
		transition_period: '1 year (enacted Jan 21, 2025 → effective Jan 22, 2026)',
		high_impact_sectors:
			'Healthcare, hiring, credit, biometrics, critical infrastructure, law enforcement',
	},
};
