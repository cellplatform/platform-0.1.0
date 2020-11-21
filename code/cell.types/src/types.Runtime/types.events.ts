export type RuntimeEvent = IRuntimeWebScriptEvent;

export type IRuntimeWebScriptEvent = {
  type: 'Runtime/web/script';
  payload: IRuntimeWebScript;
};
export type IRuntimeWebScript = {
  url: string;
  namespace: string;
  ready: boolean;
  failed: boolean;
};
