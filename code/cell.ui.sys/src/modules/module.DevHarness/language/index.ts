import { t } from '../common';

import { DevBuilder } from './DevBuilder';
export { DevBuilder };

export const dev = DevBuilder.create as t.DevFactory;
