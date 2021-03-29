import { t } from '../common';
export * from '../common/types';

export type INode = t.ITreeNode<string, INodeData>;

/**
 * Defines data that can be attached to a node.
 */
export type INodeData = INodeDataRoot | INodeDataChapter | INodeDataDoc;

export type INodeDataCommon = { backgroundImage?: string };

export type INodeDataRoot = INodeDataCommon & { type: 'ROOT' };

export type INodeDataChapter = INodeDataCommon & { type: 'CHAPTER' };

export type INodeDataDoc = INodeDataCommon & { type: 'DOC'; video?: string };
