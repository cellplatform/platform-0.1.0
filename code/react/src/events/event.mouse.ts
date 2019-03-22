import { IMouseEvent } from './types';
import { fromDocumentEvent } from './util';

export const click$ = fromDocumentEvent<IMouseEvent>('click');
export const mouseDown$ = fromDocumentEvent<IMouseEvent>('mousedown');
export const mouseUp$ = fromDocumentEvent<IMouseEvent>('mouseup');
export const mouseMove$ = fromDocumentEvent<IMouseEvent>('mousemove');
