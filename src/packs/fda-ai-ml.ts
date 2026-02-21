/**
 * FDA AI/ML Medical Device Governance Pack
 *
 * Enforces FDA guidance for AI/ML-enabled medical devices including
 * the PCCP Final Guidance (December 2024), Good Machine Learning
 * Practice (GMLP), SaMD framework, and 21 CFR 820 quality system
 * requirements as applied to AI/ML device software functions.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const fdaAiMl: GovernancePack = {
	name: 'fda-ai-ml',
	version: '1.0.0',
	description:
		'FDA AI/ML medical device compliance pack. Enforces PCCP Final Guidance (December 2024), Good Machine Learning Practice (GMLP), SaMD framework, and 21 CFR 820 quality system requirements: predetermined change control plans, real-world performance monitoring, clinical validation, data management, and transparency/labeling for AI-enabled device software functions.',
	rules: [
		{
			id: 'fda-ai-pccp-documentation',
			name: 'Predetermined Change Control Plan',
			description:
				'Verify PCCP documentation per FDA Final Guidance (Dec 2024). Must include: description of modifications, modification protocol (data collection, retraining, validation), and impact assessment.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'pccp_documented',
					'modifications_described',
					'modification_protocol',
					'impact_assessment',
				],
			},
		},
		{
			id: 'fda-ai-gmlp-compliance',
			name: 'Good Machine Learning Practice',
			description:
				'Verify adherence to GMLP principles per FDA/Health Canada/MHRA joint statement. Includes data management, model training, testing, and documentation practices.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'gmlp_practices_documented',
					'training_data_representative',
					'testing_methodology',
				],
			},
		},
		{
			id: 'fda-ai-samd-classification',
			name: 'SaMD Risk Classification',
			description:
				'Verify software as a medical device (SaMD) risk classification per IMDRF framework. Classification determines regulatory pathway (510(k), De Novo, PMA).',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['samd_classification', 'risk_category', 'regulatory_pathway'],
			},
		},
		{
			id: 'fda-ai-clinical-validation',
			name: 'Clinical Validation Evidence',
			description:
				'Verify clinical validation evidence for AI/ML device per FDA premarket requirements. Must demonstrate analytical and clinical validity.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['clinical_validation_completed', 'performance_data', 'intended_use_validated'],
			},
		},
		{
			id: 'fda-ai-data-management',
			name: 'Training Data Management',
			description:
				'Verify data management practices for AI/ML training per GMLP and 21 CFR 820. Training data must be representative, well-characterized, and version-controlled.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['data_management_plan', 'data_representativeness', 'data_version_control'],
			},
		},
		{
			id: 'fda-ai-real-world-monitoring',
			name: 'Real-World Performance Monitoring',
			description:
				'Verify post-market real-world performance monitoring plan per FDA guidance. Must detect model drift, performance degradation, and adverse events.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['monitoring_plan', 'drift_detection', 'adverse_event_reporting'],
			},
		},
		{
			id: 'fda-ai-labeling-transparency',
			name: 'AI Device Labeling and Transparency',
			description:
				'Verify device labeling includes AI/ML-specific information per FDA labeling requirements. Must disclose AI use, intended purpose, and known limitations.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_labeling_complete', 'intended_purpose_stated', 'limitations_disclosed'],
			},
		},
		{
			id: 'fda-ai-quality-system',
			name: 'Quality System Compliance',
			description:
				'Verify 21 CFR 820 quality system requirements as applied to AI/ML device software including design controls, verification, and validation',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['quality_system_documented', 'design_controls_applied'],
			},
		},
		{
			id: 'fda-ai-cybersecurity',
			name: 'AI Device Cybersecurity',
			description:
				'Verify cybersecurity measures for AI-enabled devices per FDA cybersecurity guidance. AI models may be vulnerable to adversarial attacks.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['cybersecurity_plan', 'adversarial_robustness_tested'],
			},
		},
		{
			id: 'fda-ai-bias-monitoring',
			name: 'Clinical Bias Monitoring',
			description:
				'Monitor AI outputs for demographic bias that could lead to health disparities per FDA equity and inclusion guidance',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'ethnicity'],
			},
		},
		{
			id: 'fda-ai-pii-protection',
			name: 'Patient Data Protection',
			description:
				'Detect patient PII/PHI in AI inputs to support HIPAA alignment and FDA data protection expectations',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'fda-ai-audit-trail',
			name: 'Device Audit Trail',
			description:
				'Maintain complete audit records for AI device decisions per 21 CFR 820 and FDA postmarket requirements',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'device_output',
					'evaluation_result',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'premarket_compliance',
				rules: [
					'fda-ai-pccp-documentation',
					'fda-ai-samd-classification',
					'fda-ai-clinical-validation',
					'fda-ai-gmlp-compliance',
				],
			},
			{
				name: 'data_quality',
				rules: ['fda-ai-data-management', 'fda-ai-pii-protection'],
			},
			{
				name: 'postmarket_monitoring',
				rules: ['fda-ai-real-world-monitoring', 'fda-ai-bias-monitoring', 'fda-ai-audit-trail'],
			},
			{
				name: 'safety_security',
				rules: ['fda-ai-labeling-transparency', 'fda-ai-quality-system', 'fda-ai-cybersecurity'],
			},
		],
		threshold: 0.9,
		weights: {
			premarket_compliance: 0.35,
			data_quality: 0.15,
			postmarket_monitoring: 0.25,
			safety_security: 0.25,
		},
	},
	metadata: {
		regulation: 'FDA AI/ML Medical Device Guidance Framework',
		pccp_guidance: 'Marketing Submission Recommendations for PCCP (Final, December 2024)',
		jurisdiction: 'US-FDA',
		effective_date: '2024-12-01',
		status: 'enforceable',
		enforcement: 'U.S. Food and Drug Administration (FDA)',
		scope: 'AI/ML-enabled medical devices, SaMD, clinical decision support software',
		quality_system: '21 CFR 820',
		gmlp_source: 'FDA/Health Canada/MHRA Joint Statement (2021, updated 2025)',
		regulatory_pathways: '510(k), De Novo, PMA',
		note: 'PCCP allows pre-authorized AI model updates without new submissions when following approved plan',
	},
};
