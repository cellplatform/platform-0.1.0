
export type ITreeNodeBounds = {
  node: string;
  target: 'ROOT' | 'CONTENT' | 'LABEL';
  width: number;
  height: number;
  left: number;
  top: number;
};
