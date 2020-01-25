import { CssProps, CssValue, ICssStyle } from '../types';
import { format, transformStyle } from './css';
import { className, merge } from './glamor';
import { global } from './global';
import * as head from './head';
import { toEdges, toMargins, toPadding } from './util';

const api = format as any;

api.className = className;
api.merge = merge;
api.transform = transformStyle;

api.global = global;
api.head = head.init();

api.toEdges = toEdges;
api.toMargins = toMargins;
api.toPadding = toPadding;

export { CssValue as GlamorValue, CssProps };
export const css = format as ICssStyle;
