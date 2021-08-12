export type RuntimeWebEvent = RuntimeWebScriptEvent;

/**
 * Events
 */
export type RuntimeWebScriptEvent = {
  type: 'cell.runtime.web/script';
  payload: RuntimeWebScript;
};

export type RuntimeWebScript = {
  url: string;
  namespace: string;
  ready: boolean;
  failed: boolean;
};
