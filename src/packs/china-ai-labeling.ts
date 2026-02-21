/**
 * China AI Content Labeling Governance Pack
 *
 * Enforces the CAC Measures for Labeling AI-Generated Synthetic
 * Content (March 2025, effective September 2025) and related
 * provisions from the Interim Measures for Generative AI Services
 * (August 2023) and Deep Synthesis Provisions (January 2023).
 * Covers explicit/implicit labeling, watermarking, and content marking.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const chinaAiLabeling: GovernancePack = {
	name: 'china-ai-labeling',
	version: '1.0.0',
	description:
		'China AI content labeling compliance pack. Enforces CAC Measures for Labeling AI-Generated Synthetic Content (2025): explicit labels (visible AI watermarks for chatbots, AI text, synthetic voices, face generation), implicit labels (metadata watermarks for other content), content provenance tracking, and service provider labeling obligations.',
	rules: [
		{
			id: 'cn-label-explicit-marking',
			name: 'Explicit AI Content Label',
			description:
				'Verify explicit (visible) AI labels are applied to chatbot outputs, AI-written content, synthetic voices, face generation/swap, and immersive scenes per CAC Labeling Measures. Labels must remain embedded when content is downloaded or exported.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: ['explicit_label_applied', 'label_content_type', 'label_persistent'],
			},
		},
		{
			id: 'cn-label-implicit-watermark',
			name: 'Implicit Watermark/Metadata Label',
			description:
				'Verify implicit labels (watermarks/metadata) are embedded in AI-generated content files per CAC Labeling Measures. Must include content attributes, service provider identifier, and content reference number.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'required',
				fields: [
					'implicit_label_embedded',
					'provider_identifier_included',
					'content_reference_number',
				],
			},
		},
		{
			id: 'cn-label-provider-identification',
			name: 'Service Provider Identification',
			description:
				'Verify AI service provider is identified in labels per CAC requirements. Provider name or identifier must be included in both explicit and implicit labels.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['provider_name', 'provider_identifier'],
			},
		},
		{
			id: 'cn-label-content-type-classification',
			name: 'AI Content Type Classification',
			description:
				'Verify AI-generated content is classified by type (text, image, audio, video, virtual scene) to determine appropriate labeling requirements per CAC Measures',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['content_type_classified', 'labeling_requirement_determined'],
			},
		},
		{
			id: 'cn-label-download-export-persistence',
			name: 'Label Persistence on Export',
			description:
				'Verify AI content labels persist when content is downloaded, reproduced, or exported per CAC Labeling Measures. Explicit labels must remain embedded with exported files.',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['export_label_preserved', 'download_label_preserved'],
			},
		},
		{
			id: 'cn-label-genai-compliance',
			name: 'Generative AI Service Compliance',
			description:
				'Verify compliance with Interim Measures for Generative AI Services (Aug 2023). Providers must disclose model type, dataset sources, and risk mitigation measures.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['model_type_disclosed', 'dataset_sources_described'],
			},
		},
		{
			id: 'cn-label-deep-synthesis-compliance',
			name: 'Deep Synthesis Provisions Compliance',
			description:
				'Verify compliance with Deep Synthesis Administrative Provisions (Jan 2023) for content generated using deep learning, VR, or generative algorithms',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['deep_synthesis_identified', 'synthesis_type_documented'],
			},
		},
		{
			id: 'cn-label-content-safety',
			name: 'Content Safety Screening',
			description:
				'Screen AI-generated content for prohibited content per Chinese content regulations and socialist core values requirements',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.4,
			},
		},
		{
			id: 'cn-label-pii-detection',
			name: 'Personal Information Detection',
			description:
				'Detect personal information in AI inputs per PIPL (Personal Information Protection Law) alignment',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'cn-label-audit-trail',
			name: 'Labeling Compliance Audit Trail',
			description:
				'Maintain audit records for AI content labeling compliance, supporting CAC filing and inspection requirements',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: [
					'request_id',
					'timestamp',
					'model',
					'content_type',
					'label_type',
					'governance_policy',
				],
			},
		},
	],
	scoring: {
		dimensions: [
			{
				name: 'labeling_compliance',
				rules: [
					'cn-label-explicit-marking',
					'cn-label-implicit-watermark',
					'cn-label-content-type-classification',
					'cn-label-download-export-persistence',
				],
			},
			{
				name: 'provider_obligations',
				rules: [
					'cn-label-provider-identification',
					'cn-label-genai-compliance',
					'cn-label-deep-synthesis-compliance',
				],
			},
			{
				name: 'content_safety',
				rules: ['cn-label-content-safety', 'cn-label-pii-detection'],
			},
			{
				name: 'recordkeeping',
				rules: ['cn-label-audit-trail'],
			},
		],
		threshold: 0.85,
		weights: {
			labeling_compliance: 0.4,
			provider_obligations: 0.25,
			content_safety: 0.2,
			recordkeeping: 0.15,
		},
	},
	metadata: {
		regulation: 'CAC Measures for Labeling AI-Generated Synthetic Content',
		related_regulations:
			'Interim Measures for Generative AI Services, Deep Synthesis Provisions, Algorithm Recommendation Provisions',
		jurisdiction: 'CN',
		effective_date: '2025-09-01',
		status: 'enforceable',
		enforcement: 'Cyberspace Administration of China (CAC)',
		scope: 'AI service providers generating synthetic content within China',
		labeling_types: 'Explicit (visible) and Implicit (metadata/watermark)',
		pipl_alignment: 'Personal Information Protection Law (PIPL)',
	},
};
