/**
 * Events
 */
export type CompilerEvent = BundleReqEvent | BundleResEvent;

/**
 * Compile the project into a bundle.
 */
export type BundleReqEvent = {
  type: 'cell.compiler/bundle:req';
  payload: BundleReq;
};
export type BundleReq = { tx?: string };

export type BundleResEvent = {
  type: 'cell.compiler/bundle:res';
  payload: BundleRes;
};
export type BundleRes = { tx: string; error?: string };
