import React, { useEffect, useState } from 'react';

import { useBundleManifest } from '../../../hooks';
import { bundle, css, CssValue, t } from '../common';
import { Images } from '../Views';

export type DiagramProps = {
  bus: t.EventBus<any>;
  zoom?: number;
  offset?: { x: number; y: number };
  dir?: string | string[];
  selected?: string;
  style?: CssValue;
  onSelect?: (e: { path?: string }) => void;
};

const isImagePath = (path: string) =>
  ['.png', '.jpg', '.jpeg'].map((path) => path.toLowerCase()).some((ext) => path.endsWith(ext));

export const Diagram: React.FC<DiagramProps> = (props) => {
  const { dir } = props;
  const bus = props.bus.type<t.ConversationEvent>();
  const { files } = useBundleManifest();
  const [paths, setPaths] = useState<string[]>();

  useEffect(() => {
    const dirTmp = Array.isArray(dir) ? dir[0] : dir || '';
    const paths = !dir
      ? []
      : files
          .filter(() => Boolean(dirTmp))
          .filter((file) => file.path.startsWith(dirTmp))
          .filter((file) => isImagePath(file.path))
          .map((file) => bundle.path(file.path));
    setPaths(paths);
  }, [dir, files]);

  const styles = {
    base: css({ flex: 1, position: 'relative', overflow: 'hidden' }),
    images: css({ Absolute: 0 }),
  };

  const first = paths ? paths[0] : undefined;
  const selected = props.selected ? props.selected : first;

  return (
    <div {...css(styles.base, props.style)}>
      <Images
        bus={bus}
        style={styles.images}
        paths={paths}
        zoom={props.zoom}
        offset={props.offset}
        selected={selected}
        onSelect={props.onSelect}
      />
    </div>
  );
};
