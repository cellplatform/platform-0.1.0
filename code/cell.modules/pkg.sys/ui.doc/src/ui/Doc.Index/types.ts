import * as t from '../../common/types';

export type DocIndexSelectHandler = (e: DocIndexSelectHandlerArgs) => void;
export type DocIndexSelectHandlerArgs = { doc: t.DocDef };
