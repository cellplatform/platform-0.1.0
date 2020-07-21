export type TreeNodeIdentity = {
  toString(input?: string): string;
  format(namespace?: string, id?: string): string;
  parse(input?: string): { namespace: string; id: string };
  stripNamespace(input?: string): string;
  hasNamespace(input?: string): boolean;
  namespace(input?: string): string;
  id(input?: string): string;
};
