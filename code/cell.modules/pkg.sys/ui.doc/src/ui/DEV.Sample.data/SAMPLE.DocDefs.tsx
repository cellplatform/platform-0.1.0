import { t } from '../common';

const FLOWS: t.DocDef = {
  id: 'flows',
  path: 'dao/flows-not-things',
  category: 'Conceptual Framework Series',
  title: `DAOs aren't things...\nthey are flows.`,
  subtitle: `Web3 is giving us the opportunity to rewrite how groups of people come together and do things in the world.`,
};

const SCALE: t.DocDef = {
  id: 'scale',
  path: 'dao/scale-levers',
  category: 'Conceptual Framework Series',
  title: `Scale and the levers that\nprovide DAOs their power.`,
  subtitle: `Web3 presents the possibility of a new paradigm to replace the company-centric paradigm that has been evolving over the past 400 years.`,
};

export const SAMPLE = {
  defs: [FLOWS, SCALE],

  FLOWS,
  SCALE,
};
