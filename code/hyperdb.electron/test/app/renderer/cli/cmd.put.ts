import { Command } from '../common';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [put] write to the DB.
 */
export const put = Command.create<P>('put');
