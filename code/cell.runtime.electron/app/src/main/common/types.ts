export * from '../../common/types';

/**
 * The shape of the configuration JSON file.
 */
export type IConfigFile = {
  ns: {
    /**
     * The "genesis" cell for the application.
     * This is the root entry point for the web/growth-network of the user's information space.
     */
    genesis: string;
  };
};
