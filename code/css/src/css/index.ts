import { CssProps, CssValue, ICssStyleFormat } from '../types';
import { format, transform } from './css';
import { global } from './global';
import { head } from '../head';
import { toEdges, toMargins, toPadding } from './util';

const api = format as any;

api.transform = transform;
api.global = global;
api.head = head;

api.toEdges = toEdges;
api.toMargins = toMargins;
api.toPadding = toPadding;

export { CssValue, CssProps };
export const css = format as ICssStyleFormat;
