import * as t from '../../common/types';

type Id = string;

export type ModuleCardInstance = t.CmdCardInstance;

/**
 * State
 */
export type ModuleCardBodyState = {
  url?: t.ManifestUrl;
};

export type ModuleCardBackdropState = {
  url?: t.ManifestUrl;
};

/**
 * EVENT (Definitions)
 */
export type ModuleCardEvent = t.CmdCardEvent;
