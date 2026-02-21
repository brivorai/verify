/**
 * California AI Transparency Governance Pack
 *
 * Enforces enacted California AI transparency legislation:
 * AB 2013 (Generative AI Training Data Transparency Act, effective
 * January 1, 2026) and SB 942 (California AI Transparency Act,
 * effective January 1, 2026). Note: SB 1047 was vetoed by Governor
 * Newsom in September 2024 and is NOT included.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const californiaAiTransparency: GovernancePack = {
	name: 'california-ai-transparency',
	version: '1.0.0',
	description:
		'California AI transparency compliance pack. Enforces AB 2013 (Generative AI Training Data Transparency Act): public disclosure of training data information on developer websites. Enforces SB 942 (California AI Transparency Act): AI content disclosure, detection tools, and provenance data for large GenAI providers (1M+ monthly users). Both effective January 1, 2026.',
	rules: [
		{
			id: 'ca-ai-training-data-disclosure',
			name: 'Training Data Transparency (AB 2013)',
			description:
				'Verify public posting of training data information on developer website per AB 2013. Must disclose data sources, types, and characteristics for generative AI systems available to Californians. Applies retroactively to systems available since January 1, 2022.',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['training_data_disclosure_posted', 'data_sources_described', 'disclosure_url'],
			},
		},
		{
			id: 'ca-ai-content-provenance',
			name: 'AI Content Provenance (SB 942)',
			description:
				'Verify AI-generated content includes provenance data per SB 942. Large GenAI providers (1M+ monthly visitors) must embed disclosures in AI-generated content.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['provenance_data_embedded', 'content_origin_disclosed'],
			},
		},
		{
			id: 'ca-ai-detection-tools',
			name: 'AI Content Detection Tools (SB 942)',
			description:
				'Verify availability of tools enabling users to detect AI-generated content per SB 942. Providers must make detection capabilities available.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['detection_tools_available', 'detection_method_documented'],
			},
		},
		{
			id: 'ca-ai-disclosure-manifest',
			name: 'AI System Manifest Disclosure (SB 942)',
			description:
				'Verify AI system manifest is accessible per SB 942, including system capabilities, limitations, and intended use',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_manifest_available', 'capabilities_documented', 'limitations_stated'],
			},
		},
		{
			id: 'ca-ai-user-notification',
			name: 'AI Interaction Notification',
			description:
				'Verify users are notified when interacting with AI-generated content per California transparency requirements',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_interaction_disclosed', 'notification_method'],
			},
		},
		{
			id: 'ca-ai-developer-scope',
			name: 'Developer Applicability Assessment',
			description:
				'Verify developer applicability under AB 2013 (any GenAI available to Californians) and SB 942 (1M+ monthly visitors). Determines which obligations apply.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['developer_classification', 'california_availability', 'monthly_users_threshold'],
			},
		},
		{
			id: 'ca-ai-content-watermarking',
			name: 'AI Content Watermarking',
			description:
				'Verify AI-generated content is watermarked or labeled per SB 942 provenance requirements. Supports content authenticity and detection.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['watermark_applied', 'watermark_method'],
			},
		},
		{
			id: 'ca-ai-bias-monitoring',
			name: 'Fairness Monitoring',
			description:
				'Monitor AI outputs for bias per California civil rights protections. CPPA ADMT rulemaking may add additional requirements.',
			phase: 'post',
			severity: 'medium',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: ['race', 'sex', 'age', 'disability', 'national_origin'],
			},
		},
		{
			id: 'ca-ai-pii-protection',
			name: 'Consumer Privacy Protection',
			description:
				'Detect PII in AI inputs per CCPA/CPRA alignment. California consumer privacy protections apply to AI system data processing.',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'ca-ai-audit-trail',
			name: 'Transparency Audit Trail',
			description:
				'Maintain audit records for AI operations to support compliance evidence for AB 2013 and SB 942 requirements',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'content_provenance',
					'evaluation_result',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'training_data_transparency',
				rules: ['ca-ai-training-data-disclosure', 'ca-ai-developer-scope'],
			},
			{
				name: 'content_provenance',
				rules: ['ca-ai-content-provenance', 'ca-ai-content-watermarking', 'ca-ai-detection-tools'],
			},
			{
				name: 'user_transparency',
				rules: ['ca-ai-user-notification', 'ca-ai-disclosure-manifest'],
			},
			{
				name: 'consumer_protection',
				rules: ['ca-ai-bias-monitoring', 'ca-ai-pii-protection', 'ca-ai-audit-trail'],
			},
		],
		threshold: 0.8,
		weights: {
			training_data_transparency: 0.3,
			content_provenance: 0.3,
			user_transparency: 0.2,
			consumer_protection: 0.2,
		},
	},
	metadata: {
		regulation: 'California AI Transparency Legislation (AB 2013 & SB 942)',
		ab_2013: 'Generative AI Training Data Transparency Act (signed Sep 28, 2024)',
		sb_942: 'California AI Transparency Act (signed Sep 19, 2024)',
		jurisdiction: 'US-CA',
		effective_date: '2026-01-01',
		status: 'enforceable',
		enforcement: 'California Attorney General, CPPA (for ADMT rules)',
		scope:
			'AB 2013: All GenAI developers with California users. SB 942: GenAI providers with 1M+ monthly visitors.',
		sb_1047_status: 'Vetoed by Governor Newsom (September 2024) — NOT included',
		cppa_admt_status: 'CPPA automated decision-making technology rulemaking ongoing',
		retroactive_scope: 'AB 2013 applies to GenAI systems available since January 1, 2022',
	},
};
