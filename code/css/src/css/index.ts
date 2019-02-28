import { GlamorValue, CssProps, IStyle } from '../types';
import { format, transformStyle } from './css';
import { className, merge } from './glamor';
import { arrayToEdges } from './util';
import { global } from './global';
import * as head from './head';

const api = format as any;

api.className = className;
api.merge = merge;
api.transform = transformStyle;
api.arrayToEdges = arrayToEdges;
api.global = global;
api.head = head;

export { GlamorValue, CssProps };
export const css = format as IStyle;
