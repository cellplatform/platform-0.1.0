export * from '@platform/ui.tree/lib/types';
export * from '@platform/ui.text/lib/types';
export * from '@platform/ui.button/lib/types';
export * from '@platform/ui.icon/lib/types';

export * from '../types';

import * as t from '../types';
import { ITreeNode } from '@platform/ui.tree/lib/types';

export type IPropNodeData = { path: string; key: string; value: t.PropValue };
export type IPropNode = ITreeNode<string, IPropNodeData>;
