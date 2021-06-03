export * from '../../common/types';

type NamespaceUri = string;

/**
 * The shape of the application configuration file (JSON).
 */
export type IConfigFile = {
  created: { process: string; time: number };
  refs: {
    /**
     * The user's "genesis" cell.
     *
     * This is the root entry point for the network of information
     * that grows around the user.
     */
    genesis: NamespaceUri; // eg. "ns:<id>"
  };
};
