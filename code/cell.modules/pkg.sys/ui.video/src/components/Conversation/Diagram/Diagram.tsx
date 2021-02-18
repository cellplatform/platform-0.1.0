import React, { useEffect, useState } from 'react';

import { useBundleManifest } from '../../../hooks';
import { bundle, css, CssValue } from '../common';
import { DotSelector, DotSelectorItem } from '../DotSelector';
import { Images } from '../Views';

export type DiagramProps = {
  dir?: string;
  style?: CssValue;
};

console.log('bundle', bundle);

const isImagePath = (path: string) =>
  ['.png', '.jpg', '.jpeg'].map((path) => path.toLowerCase()).some((ext) => path.endsWith(ext));

export const Diagram: React.FC<DiagramProps> = (props) => {
  const { dir } = props;
  const { files } = useBundleManifest();
  const [paths, setPaths] = useState<string[]>();

  useEffect(() => {
    const paths = !dir
      ? []
      : files
          .filter((file) => file.path.startsWith(dir))
          .filter((file) => isImagePath(file.path))
          .map((file) => bundle.path(file.path));

    setPaths(paths);
  }, [files, dir]);

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }),
    images: css({ Absolute: 0 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <Images style={styles.images} paths={paths} />
    </div>
  );
};
