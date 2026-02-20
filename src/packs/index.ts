/**
 * Built-in governance pack registry.
 * @module
 */

import type { GovernancePack } from '../types.js';
import { ccpaAdmt } from './ccpa-admt.js';
import { coloradoAiAct } from './colorado-ai-act.js';
import { euAiActV1 } from './eu-ai-act-v1.js';
import { euAiActV2 } from './eu-ai-act-v2.js';
import { hipaaAi } from './hipaa-ai.js';
import { minimal } from './minimal.js';
import { nistAiRmf } from './nist-ai-rmf.js';
import { soc2Ai } from './soc2-ai.js';

export const builtinPacks = new Map<string, GovernancePack>([
	['eu-ai-act-v1', euAiActV1],
	['eu-ai-act-v2', euAiActV2],
	['eu-ai-act', euAiActV2],
	['minimal', minimal],
	['soc2-ai', soc2Ai],
	['ccpa-admt', ccpaAdmt],
	['hipaa-ai', hipaaAi],
	['nist-ai-rmf', nistAiRmf],
	['colorado-ai-act', coloradoAiAct],
]);
