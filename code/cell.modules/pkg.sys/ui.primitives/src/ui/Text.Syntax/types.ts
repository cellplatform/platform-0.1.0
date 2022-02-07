export type SyntaxLabelTokenizer = (text: string) => SyntaxLabelTokens;

export type SyntaxLabelTokens = {
  text: string;
  parts: SyntaxLabelToken[];
};

export type SyntaxLabelToken = {
  text: string;
  color: string;
};
