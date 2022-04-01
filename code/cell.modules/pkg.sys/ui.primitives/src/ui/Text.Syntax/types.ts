type Color = string | number;

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
