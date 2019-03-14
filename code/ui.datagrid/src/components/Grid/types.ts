import { EditorEvent } from '../Editor/types';

export type EditorFactory = () => JSX.Element | null;

/**
 * [Events]
 */
export type GridEvent = EditorEvent;
