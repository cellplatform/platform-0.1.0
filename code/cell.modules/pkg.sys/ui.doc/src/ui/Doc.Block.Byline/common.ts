import * as t from '../../common/types';
export * from '../common';

/**
 * Constants
 */
export const ALL = {
  parts: <t.DocBylinePart[]>['Doc.Identity', 'Doc.Author.Signature', 'Space'],
};

export const DEFAULT = {
  parts: <t.DocBylinePart[]>['Doc.Identity', 'Doc.Author.Signature'],
};
