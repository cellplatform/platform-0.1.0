import * as React from 'react';
import { imports } from './imports';
// import { TrainingRoot } from './components/Training/Training.Root';
// import { TrainingVideo } from './components/Training/Training.Video';
// import * as t from './types';
import { t, TreeUtil } from '../common';

/**
 * Renders the [Doc] viewer for the given node.
 */
export async function renderDocViewer(args: {
  ctx: t.IAppContext;
  root: t.ITreeNode;
  nodeId: string;
}) {
  const { nodeId } = args;
  const root = args.root as t.INode;
  const depth = nodeId ? TreeUtil.depth(root, nodeId) - 1 : 0;

  const bg = TreeUtil.ancestor<t.INode>(root, nodeId, (e) => Boolean(e.node.data?.backgroundImage));
  const background = bg?.data?.backgroundImage;

  const Doc = (await imports.doc).Doc;
  const el = <div>Hello</div>;

  return (
    <Doc depth={depth} background={background}>
      {el}
    </Doc>
  );
}
