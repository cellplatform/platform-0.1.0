/**
 * EVENTS
 */
export type RuntimeEvent = IRuntimeScriptEvent;

export type IRuntimeScriptEvent = {
  type: 'Runtime/script';
  payload: IRuntimeScript;
};
export type IRuntimeScript = {
  url: string;
  namespace: string;
  ready: boolean;
  failed: boolean;
};
