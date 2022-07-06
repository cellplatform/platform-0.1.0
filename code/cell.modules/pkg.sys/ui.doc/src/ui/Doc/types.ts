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

export type DocBlockMargin = { top?: number; bottom?: number };

/**
 * Blocks
 */

export type DocDefBlock = DocDefMarkdownBlock | DocDefImageBlock | DocDefInsetPanelBlock;

export type DocDefMarkdownBlock = {
  kind: 'Markdown';
  text: string;
  margin?: DocBlockMargin;
};

export type DocDefImageBlock = {
  kind: 'Image';
  url: string;
  credit?: string;
  margin?: DocBlockMargin;
};

export type DocDefInsetPanelBlock = {
  kind: 'InsetPanel';
  markdown: string;
  margin?: DocBlockMargin;
};
