/**
 * Texas Responsible AI Governance Act (TRAIGA) (HB 149) Governance Pack
 *
 * Enforces AI prohibitions including manipulation, intentional
 * discrimination, CSAM/deepfakes, social scoring (government),
 * biometric misuse (government), political viewpoint discrimination,
 * and government/healthcare AI disclosure obligations per
 * Tex. Bus. & Com. Code Ch. 551-554.
 * @module
 */

import type { GovernancePack } from '../types.js';

export const texasTraiga: GovernancePack = {
	name: 'texas-traiga',
	version: '1.0.0',
	description:
		'Texas Responsible AI Governance Act (TRAIGA, HB 149) compliance pack. Enforces AI prohibitions per Tex. Bus. & Com. Code Ch. 551-554: manipulation ban (Sec. 552.052), intentional discrimination (Sec. 552.056), CSAM/deepfakes (Sec. 552.057), social scoring ban for government (Sec. 552.053), biometric misuse ban for government (Sec. 552.054), political viewpoint discrimination (Sec. 552.058), constitutional rights (Sec. 552.055), government AI disclosure (Sec. 552.051), and NIST AI RMF safe harbor documentation.',
	rules: [
		{
			id: 'tx-prohibited-manipulation-screening',
			name: 'Manipulation and Harm Screening',
			description:
				'Screen AI outputs for content that could constitute prohibited manipulation — intentionally inciting or encouraging self-harm, harm to others, or criminal activity per Sec. 552.052',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'toxicity_threshold',
				max_score: 0.4,
			},
		},
		{
			id: 'tx-discrimination-intent-detection',
			name: 'Discriminatory Output Detection',
			description:
				'Detect potential discriminatory patterns in AI outputs across protected classes under state and federal civil rights law. TRAIGA requires intent to discriminate — disparate impact alone is insufficient per Sec. 552.056. Flags potential discrimination for human review.',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'bias_detection',
				protected_attributes: [
					'race',
					'color',
					'national_origin',
					'sex',
					'age',
					'religion',
					'disability',
				],
			},
		},
		{
			id: 'tx-discrimination-pattern-flag',
			name: 'Discrimination Pattern Detection',
			description:
				'Flag output patterns where adverse outcomes appear linked to protected attribute language, potentially indicating discriminatory intent violating Sec. 552.056',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'regex',
				field: 'output',
				pattern:
					'(?i)(denied|rejected|ineligible|disqualified|not\\s+approved|adverse).{0,100}(based\\s+on|due\\s+to|because\\s+of).{0,50}(age|race|gender|sex|disabilit|ethnic|religion|national\\s+origin|color)',
			},
		},
		{
			id: 'tx-government-ai-disclosure',
			name: 'Government AI Interaction Disclosure',
			description:
				'Verify AI interaction disclosure is provided to consumers when deployer is a government agency. Must be clear, conspicuous, plain language, provided before or at time of interaction, and free of dark patterns per Sec. 552.051',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['ai_disclosure_present', 'disclosure_method', 'disclosure_timing'],
			},
		},
		{
			id: 'tx-healthcare-ai-disclosure',
			name: 'Healthcare AI Disclosure',
			description:
				'Verify AI use disclosure for healthcare service delivery contexts. Private healthcare providers must disclose AI use in service delivery to patients per TRAIGA healthcare provisions.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['healthcare_ai_disclosure', 'patient_notification'],
			},
		},
		{
			id: 'tx-nist-framework-safe-harbor',
			name: 'NIST AI RMF Safe Harbor Documentation',
			description:
				'Verify documentation of NIST AI Risk Management Framework alignment or recognized equivalent. Substantial compliance serves as an affirmative defense under TRAIGA. Defendants receive rebuttable presumption of reasonable care.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'contains',
				field: 'risk_management_framework',
				values: [
					'NIST AI RMF',
					'NIST AI 100-1',
					'NIST AI RMF GenAI Profile',
					'ISO 42001',
					'ISO/IEC 42001',
				],
			},
		},
		{
			id: 'tx-cid-readiness-documentation',
			name: 'Civil Investigative Demand Readiness',
			description:
				'Verify documentation is maintained to respond to AG Civil Investigative Demands per Sec. 552.103. AG can demand system purpose, training data descriptions, performance metrics, risk assessments, known limitations, and monitoring information. A single consumer complaint can trigger a CID.',
			phase: 'pre',
			severity: 'high',
			evaluate: {
				type: 'required',
				fields: ['system_purpose', 'intended_use', 'known_limitations', 'performance_metrics'],
			},
		},
		{
			id: 'tx-csam-content-screening',
			name: 'Prohibited Sexual Content Screening',
			description:
				'Screen AI outputs for content that could constitute prohibited sexually explicit material per Sec. 552.057 — CSAM, deepfake pornography (Penal Code 21.165), or text impersonating minors for sexual content',
			phase: 'post',
			severity: 'critical',
			evaluate: {
				type: 'custom',
				fn: 'csam_screening',
			},
		},
		{
			id: 'tx-pii-detection',
			name: 'Personal and Biometric Data Detection',
			description:
				'Detect PII in AI inputs to support compliance with TRAIGA biometric data protections (Sec. 552.054), consumer privacy provisions, and CUBI amendments (Sec. 503.001)',
			phase: 'pre',
			severity: 'medium',
			evaluate: {
				type: 'pii_detection',
				fields: ['prompt'],
				action: 'flag',
			},
		},
		{
			id: 'tx-social-scoring-detection',
			name: 'Social Scoring Pattern Detection',
			description:
				'Detect patterns in AI inputs that could indicate social scoring or citizen scoring use cases, which are prohibited for government entities per Sec. 552.053',
			phase: 'pre',
			severity: 'critical',
			evaluate: {
				type: 'regex',
				field: 'input',
				pattern:
					'(?i)(social\\s*scor|citizen\\s*scor|trustworthiness\\s*scor|behavioral\\s*scor|social\\s*credit|risk\\s*profil.{0,20}(citizen|resident|individual)|surveillance\\s*scor)',
			},
		},
		{
			id: 'tx-political-viewpoint-screening',
			name: 'Political Viewpoint Discrimination Screening',
			description:
				'Screen AI outputs for patterns that could indicate political viewpoint discrimination or infringement on freedom of association per Sec. 552.058',
			phase: 'post',
			severity: 'high',
			evaluate: {
				type: 'regex',
				field: 'output',
				pattern:
					'(?i)(denied|rejected|restricted|blocked|removed|suppressed).{0,80}(political|partisan|conservative|liberal|republican|democrat|political\\s*view|political\\s*opinion|political\\s*affiliation)',
			},
		},
		{
			id: 'tx-audit-trail',
			name: 'TRAIGA Compliance Audit Trail',
			description:
				'Ensure complete audit records for AI operations to support AG CID responses (Sec. 552.103), NIST safe harbor documentation, and 60-day cure period compliance evidence',
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
				name: 'prohibited_practices',
				rules: [
					'tx-prohibited-manipulation-screening',
					'tx-csam-content-screening',
					'tx-social-scoring-detection',
					'tx-political-viewpoint-screening',
				],
			},
			{
				name: 'nondiscrimination',
				rules: ['tx-discrimination-intent-detection', 'tx-discrimination-pattern-flag'],
			},
			{
				name: 'transparency',
				rules: ['tx-government-ai-disclosure', 'tx-healthcare-ai-disclosure'],
			},
			{
				name: 'compliance_readiness',
				rules: [
					'tx-nist-framework-safe-harbor',
					'tx-cid-readiness-documentation',
					'tx-pii-detection',
					'tx-audit-trail',
				],
			},
		],
		threshold: 0.75,
		weights: {
			prohibited_practices: 0.35,
			nondiscrimination: 0.25,
			transparency: 0.15,
			compliance_readiness: 0.25,
		},
	},
	metadata: {
		regulation: 'Texas Responsible AI Governance Act (TRAIGA)',
		bill: 'HB 149 (89th Legislature)',
		statute: 'Tex. Bus. & Com. Code Ch. 551-554',
		jurisdiction: 'US-TX',
		effective_date: '2026-01-01',
		status: 'enforceable',
		enforcement: 'Texas Attorney General (exclusive)',
		penalty_curable: '$10,000-$12,000 per violation',
		penalty_uncurable: '$80,000-$200,000 per violation',
		penalty_continuing: '$2,000-$40,000 per day',
		cure_period_days: 60,
		private_right_of_action: false,
		safe_harbor: 'NIST AI RMF: Generative AI Profile or recognized equivalent',
		rebuttable_presumption: 'Reasonable care presumed for defendants',
		statewide_preemption: true,
		approach: 'Prohibitions-based (not comprehensive regulatory framework)',
		note: 'HB 149 replaced original HB 1709 which contained extensive private-sector obligations. Final law is significantly narrower.',
	},
};
