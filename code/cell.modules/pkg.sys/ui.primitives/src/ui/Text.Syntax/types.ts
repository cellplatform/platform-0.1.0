import { CSSProperties } from 'react';
import * as t from '../../common/types';

type Color = string | number;

/**
 * Component
 */
export type TextSyntaxTheme = 'Dark' | 'Light';
export type TextSyntaxProps = {
  children?: React.ReactNode;
  text?: string;
  inlineBlock?: boolean;
  margin?: t.CssEdgesInput;
  padding?: t.CssEdgesInput;
  tokenizer?: TextSyntaxTokenizer;
  colors?: Partial<TextSyntaxColors>;
  theme?: TextSyntaxTheme;
  fontSize?: CSSProperties['fontSize'];
  fontWeight?: CSSProperties['fontWeight'];
  monospace?: boolean;
  ellipsis?: boolean;
  style?: t.CssValue;
};

/**
 * Tokenization
 */
export type TextSyntaxTokenizer = (text: string) => TextSyntaxTokens;

export type TextSyntaxTokens = {
  text: string;
  parts: TextSyntaxToken[];
};

export type TextSyntaxTokenKind = 'Brace' | 'Predicate' | 'Word' | 'Colon';
export type TextSyntaxBraceKind = '<>' | '{}' | '[]';

export type TextSyntaxToken = {
  text: string;
  kind: TextSyntaxTokenKind;
  within?: TextSyntaxBraceKind;
};

export type TextSyntaxColors = {
  Brace: Color;
  Predicate: Color;
  Colon: Color;
  Word: { Base: Color; Element: Color };
};
