export type TreeIdentity = {
  toString(input?: string): string;
  format(namespace?: string, key?: string): string;
  parse(input?: string): { namespace: string; key: string; id: string };
  stripNamespace(input?: string): string;
  hasNamespace(input?: string): boolean;
  namespace(input?: string): string;
  key(input?: string): string;
};
