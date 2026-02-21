/**
 * Built-in governance pack registry.
 * @module
 */

import type { GovernancePack } from '../types.js';
import { californiaAiTransparency } from './california-ai-transparency.js';
import { canadaAida } from './canada-aida.js';
import { ccpaAdmt } from './ccpa-admt.js';
import { chinaAiLabeling } from './china-ai-labeling.js';
import { chinaCybersecurityAi } from './china-cybersecurity-ai.js';
import { coloradoAiAct } from './colorado-ai-act.js';
import { euAiActV1 } from './eu-ai-act-v1.js';
import { euAiActV2 } from './eu-ai-act-v2.js';
import { fdaAiMl } from './fda-ai-ml.js';
import { hipaaAi } from './hipaa-ai.js';
import { iso27001Ai } from './iso-27001-ai.js';
import { iso42001 } from './iso-42001.js';
import { japanAiGovernance } from './japan-ai-promotion.js';
import { minimal } from './minimal.js';
import { nistAiRmf } from './nist-ai-rmf.js';
import { nycLl144 } from './nyc-ll144.js';
import { nydfsAi } from './nydfs-ai.js';
import { oecdAiPrinciples } from './oecd-ai-principles.js';
import { secAi } from './sec-ai.js';
import { singaporeAiGovernance } from './singapore-ai-governance.js';
import { soc2Ai } from './soc2-ai.js';
import { southKoreaAiBasicAct } from './south-korea-ai-basic-act.js';
import { texasTraiga } from './texas-traiga.js';

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
	['texas-traiga', texasTraiga],
	['iso-42001', iso42001],
	['nyc-ll144', nycLl144],
	['south-korea-ai-basic-act', southKoreaAiBasicAct],
	['singapore-ai-governance', singaporeAiGovernance],
	['nydfs-ai', nydfsAi],
	['sec-ai', secAi],
	['fda-ai-ml', fdaAiMl],
	['china-ai-labeling', chinaAiLabeling],
	['china-cybersecurity-ai', chinaCybersecurityAi],
	['japan-ai-governance', japanAiGovernance],
	['iso-27001-ai', iso27001Ai],
	['oecd-ai-principles', oecdAiPrinciples],
	['california-ai-transparency', californiaAiTransparency],
	['canada-aida', canadaAida],
]);
