import { t } from './common';

type Uri = string;

/**
 * HTTP (Server)
 */
export type IResGetElectronSysInfo = t.IResGetSysInfo & { runtime: t.ElectronRuntimeInfo };

/**
 * The shape of the application configuration file (JSON).
 */
export type ElectronConfigFile = {
  created: ElectronRuntimeIdentifierLogItem;
  started: ElectronRuntimeIdentifierLogItem[];
  refs: {
    /**
     * The user's "genesis" cell.
     *
     * This is the root entry point for the network of information
     * that grows around the user.
     */
    genesis: Uri; // eg. "cell:<id>:A1"
  };
};

export type ElectronRuntimeIdentifierLogItem = { process: string; time: number };
