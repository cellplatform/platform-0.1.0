import { CssProps, EdgesInput, GlamorValue, IMarginEdges, IPaddingEdges, IStyle } from '../types';
import { format, transformStyle } from './css';
import { className, merge } from './glamor';
import { global } from './global';
import * as head from './head';
import { arrayToEdges, prefixEdges } from './util';

const api = format as any;

api.className = className;
api.merge = merge;
api.transform = transformStyle;
api.arrayToEdges = arrayToEdges;
api.toMargins = (edges: EdgesInput) => prefixEdges<IMarginEdges>('margin', arrayToEdges(edges));
api.toPadding = (edges: EdgesInput) => prefixEdges<IPaddingEdges>('padding', arrayToEdges(edges));
api.global = global;
api.head = head;

export { GlamorValue, CssProps };
export const css = format as IStyle;
