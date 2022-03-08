import * as t from '../types';

export * from '../../../common/types';
export * from '../types';
export { BulletProps } from '../../Bullet';

/**
 * Internal
 */
export type CtxItem = { kind: 'Item'; index: number; total: number; item: t.ListItem };
export type CtxList = { kind: 'List'; total: number };
