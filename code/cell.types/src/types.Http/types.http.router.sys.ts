type O = Record<string, unknown>;

/**
 * Info (System)
 */
export type IReqQuerySysInfo = O; // 🐷 Placeholder type.
export type IResGetSysInfo = {
  name: string;
  host: string;
  system: string;
  region: string;
  deployedAt?: number;
  hash?: string;
};

export type IReqQuerySysUid = { total?: number };
export type IResGetSysUid = string[];
