/**
 * China Cybersecurity AI Governance Pack
 *
 * Enforces China's multi-layered AI regulatory framework including
 * the Interim Measures for Generative AI Services (Aug 2023),
 * Algorithm Recommendation Provisions (Mar 2022), Cybersecurity Law,
 * Data Security Law, and PIPL as applied to AI systems. Covers
 * algorithm filing, security assessments, and data localization.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const chinaCybersecurityAi: GovernancePack = {
	name: 'china-cybersecurity-ai',
	version: '1.0.0',
	description:
		'China cybersecurity AI compliance pack. Enforces Interim Measures for Generative AI Services (Aug 2023), Algorithm Recommendation Provisions (Mar 2022), Cybersecurity Law, Data Security Law, and PIPL: algorithm filing with CAC, security assessments, data localization, content moderation, and public opinion management for AI services with social mobilization capabilities.',
	rules: [
		{
			id: 'cn-cyber-algorithm-filing',
			name: 'Algorithm Filing with CAC',
			description:
				'Verify algorithm filing with CAC per Algorithm Recommendation Provisions. Algorithms with public opinion attributes or social mobilization capabilities must complete filing procedures.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['algorithm_filing_completed', 'filing_number', 'algorithm_type_registered'],
			},
		},
		{
			id: 'cn-cyber-security-assessment',
			name: 'Security Assessment',
			description:
				'Verify security assessment completed per Interim Measures for GenAI Services. Providers with public opinion attributes must conduct security assessments before launch.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['security_assessment_completed', 'assessment_date', 'risk_findings_addressed'],
			},
		},
		{
			id: 'cn-cyber-genai-provider-obligations',
			name: 'Generative AI Provider Obligations',
			description:
				'Verify compliance with core provider obligations under Interim Measures: model type disclosure, training data description, risk mitigation, and designated responsible personnel.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'model_type_disclosed',
					'training_data_described',
					'risk_mitigation_documented',
					'responsible_personnel_designated',
				],
			},
		},
		{
			id: 'cn-cyber-data-localization',
			name: 'Data Localization Compliance',
			description:
				'Verify data localization requirements per Cybersecurity Law and Data Security Law. Personal information and important data must be stored within mainland China.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['data_storage_location', 'cross_border_assessment'],
			},
		},
		{
			id: 'cn-cyber-content-moderation',
			name: 'Content Moderation System',
			description:
				'Verify content moderation system per Interim Measures and Cybersecurity Law. AI services must not generate content that subverts state power, undermines national unity, or violates content regulations.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.3,
			},
		},
		{
			id: 'cn-cyber-prohibited-content-detection',
			name: 'Prohibited Content Pattern Detection',
			description:
				'Detect patterns in AI outputs that could violate Chinese content regulations including content undermining state power, ethnic unity, or social stability',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'regex',
				field: 'output',
				pattern:
					'(?i)(subvert|overthrow|separatis|secession|undermine).{0,50}(state|government|party|national\\s+unity|territorial\\s+integrity)',
			},
		},
		{
			id: 'cn-cyber-training-data-compliance',
			name: 'Training Data Compliance',
			description:
				'Verify training data compliance per Interim Measures. Training data must not infringe intellectual property, must respect personal information rights, and must comply with data security requirements.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['training_data_compliance', 'ip_rights_verified', 'personal_info_consent'],
			},
		},
		{
			id: 'cn-cyber-user-real-identity',
			name: 'Real-Name Verification',
			description:
				'Verify real-name registration system per Cybersecurity Law and Interim Measures. Users of generative AI services must be verified.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['real_name_verification_enabled', 'identity_verification_method'],
			},
		},
		{
			id: 'cn-cyber-pii-protection',
			name: 'Personal Information Protection',
			description:
				'Detect personal information in AI inputs per PIPL compliance. Processing must have lawful basis and follow data minimization principles.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'cn-cyber-audit-trail',
			name: 'Regulatory Audit Trail',
			description:
				'Maintain complete audit records per CAC filing and inspection requirements. Must support algorithm recommendation transparency and security assessment evidence.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'content_moderation_result',
					'evaluation_result',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'regulatory_compliance',
				rules: [
					'cn-cyber-algorithm-filing',
					'cn-cyber-security-assessment',
					'cn-cyber-genai-provider-obligations',
				],
			},
			{
				name: 'content_safety',
				rules: ['cn-cyber-content-moderation', 'cn-cyber-prohibited-content-detection'],
			},
			{
				name: 'data_security',
				rules: [
					'cn-cyber-data-localization',
					'cn-cyber-training-data-compliance',
					'cn-cyber-pii-protection',
				],
			},
			{
				name: 'operational_compliance',
				rules: ['cn-cyber-user-real-identity', 'cn-cyber-audit-trail'],
			},
		],
		threshold: 0.9,
		weights: {
			regulatory_compliance: 0.3,
			content_safety: 0.3,
			data_security: 0.25,
			operational_compliance: 0.15,
		},
	},
	metadata: {
		regulation: 'China Multi-Layer AI Regulatory Framework',
		primary_regulations:
			'Interim Measures for Generative AI Services (Aug 2023), Algorithm Recommendation Provisions (Mar 2022)',
		foundational_laws: 'Cybersecurity Law, Data Security Law, PIPL',
		jurisdiction: 'CN',
		effective_date: '2023-08-15',
		status: 'enforceable',
		enforcement: 'Cyberspace Administration of China (CAC)',
		scope: 'AI service providers operating within mainland China',
		filing_requirement: 'Algorithm filing mandatory for services with public opinion attributes',
		data_localization: 'Personal information and important data must be stored in mainland China',
	},
};
