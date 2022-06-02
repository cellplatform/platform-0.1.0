type UrlPath = string;

/**
 * Definition of a document layout.
 */
export type DocDef = {
  id: string;
  path: UrlPath;
  version: string;
  author: { name: string; avatar: string };
  title: string;
  category?: string;
  subtitle?: string;
  banner?: { url: string; credit?: string };
  blocks?: DocDefBlock[];
};

export type DocDefBlock = DocDefMarkdownBlock | DocDefImageBlock;

export type DocDefMarkdownBlock = {
  kind: 'Markdown';
  text: string;
};

export type DocDefImageBlock = {
  kind: 'Image';
  url: string;
  credit?: string;
  margin?: { top?: number; bottom?: number };
};
