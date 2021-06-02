export * from '../../common/types';

type Uri = string;

/**
 * The shape of the configuration JSON file.
 */
export type IConfigFile = {
  created: { by: string; at: number };
  refs: {
    /**
     * The "genesis" cell for the application.
     * This is the root entry point for the web/growth-network of the user's information space.
     */
    genesis: Uri;
  };
};
