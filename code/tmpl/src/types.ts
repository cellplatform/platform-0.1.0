
/**
 * The source location of template file(s).
 */
export type ITemplateSource = {
  dir: string;
  pattern?: string; // Glob pattern.
  targetDir?: string; // The path to prefix the template with when added (allow composition).
};

/**
 * Represents a single template file.
 */
export type ITemplateFile = {
  base: string;
  source: string;
  target: string;
  isBinary: boolean;
};

/**
 * Represents a set of custom values passed in to a template.
 */
export type IVariables = { [key: string]: any };

/**
 * Filter.
 */
export type TemplateFilter = (file: ITemplateFile) => boolean;

/**
 * [EVENTS]
 */
export type ITemplateEvent = IExecuteTemplateStart | IExecuteTemplateComplete | ITemplateAlert;

/**
 * Event: [Executing]
 */
export type IExecutePayload = {
  files: ITemplateFile[];
};
export type IExecuteTemplateStart = {
  type: 'EXECUTE/start';
  payload: IExecutePayload;
};
export type IExecuteTemplateComplete = {
  type: 'EXECUTE/complete';
  payload: IExecutePayload;
};

/**
 * Event: [Alerting]
 *
 * An alert notification fired from middleware.
 * Example usage:
 *    Communicating progress or state change to a
 *    running [Listr] task.
 */
export type ITemplateAlertPayload = { message: string };
export type ITemplateAlert = {
  type: 'ALERT';
  payload: ITemplateAlertPayload;
};

/**
 * [MIDDLEWARE]
 */
export type TemplateMiddleware<V extends IVariables = {}> = (
  req: ITemplateRequest<V>,
  res: ITemplateResponse,
) => any | Promise<any>;
export type TemplatePathFilter = RegExp;

/**
 * Middleware: [Request]
 */
export type ITemplateRequest<V extends IVariables = {}> = {
  path: {
    source: string;
    target: string;
  };
  buffer: Buffer;
  text?: string;
  isBinary: boolean;
  variables: V;
};

/**
 * Middleware: [Response]
 */
export type AfterTemplateMiddleware = 'NEXT' | 'COMPLETE';

export type ITemplateResponse = {
  text: string | undefined;
  replaceText: ReplaceTemplateText;
  alert: <T extends ITemplateAlertPayload>(e: T) => ITemplateResponse;
  next: () => void;
  complete: () => void;
  done: (next?: AfterTemplateMiddleware) => void;
};

// NB: Taken from the [lib.dom.d.ts] types.
export type ReplaceTemplateText = (
  searchValue: {
    [Symbol.replace](string: string, replaceValue: string): string;
  },
  replaceValue: string,
) => ITemplateResponse;
