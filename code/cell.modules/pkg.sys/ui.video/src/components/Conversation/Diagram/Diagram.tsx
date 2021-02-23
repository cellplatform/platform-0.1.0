import React, { useEffect, useState } from 'react';

import { useBundleManifest } from '../../../hooks';
import { bundle, css, CssValue } from '../common';
import { Images } from '../Views';

export type DiagramProps = {
  dir?: string | string[];
  style?: CssValue;
};

const isImagePath = (path: string) =>
  ['.png', '.jpg', '.jpeg'].map((path) => path.toLowerCase()).some((ext) => path.endsWith(ext));

export const Diagram: React.FC<DiagramProps> = (props) => {
  const { dir } = props;
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
