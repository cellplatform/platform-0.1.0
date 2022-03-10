type Color = string | number;

export type SyntaxLabelTokenizer = (text: string) => SyntaxLabelTokens;

export type SyntaxLabelTokens = {
  text: string;
  parts: SyntaxLabelToken[];
};

export type SyntaxLabelTokenKind = 'Brace' | 'Predicate' | 'Word' | 'Colon';
export type SyntaxLabelToken = {
  text: string;
  kind: SyntaxLabelTokenKind;
};

export type SyntaxLabelColors = {
  Brace: Color;
  Predicate: Color;
  Word: Color;
  Colon: Color;
};
