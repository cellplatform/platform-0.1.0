type UrlPath = string;

/**
 * Definition of a document layout.
 */
export type DocDef = {
  id: string;
  path: UrlPath;
  title: string;
  category?: string;
  subtitle?: string;
};
