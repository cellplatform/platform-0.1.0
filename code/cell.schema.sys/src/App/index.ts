import * as t from '../types';

import { AppManifest } from './AppManifest';
export { AppManifest };

import { AppSchema } from './AppSchema';
export { AppSchema };

/**
 * NB: Export classes as constrained interfaces.
 */
import { AppModel as AppModelClass, AppWindowModel as AppWindowModelClass } from './models';
export const AppModel = AppModelClass as t.AppModel;
export const AppWindowModel = AppWindowModelClass as t.AppWindowModel;
