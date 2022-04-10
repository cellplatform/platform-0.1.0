import * as t from '../../common/types';

type Id = string;

export type ModuleCardInstance = t.CmdCardInstance;

/**
 * State
 */
export type ModuleCardState = t.CmdCardState<ModuleCardStateBody, ModuleCardStateBackdrop>;

export type ModuleCardStateBody = {
  tmp: number;
};

export type ModuleCardStateBackdrop = {
  tmp: number;
};

/**
 * EVENT (Definitions)
 */
export type ModuleCardEvent = t.CmdCardEvent;
