import React from 'react';

import { COLORS, css, CssValue, t } from '../../common';
import { Icons } from './Icons';

/**
 * Single file
 */
export type FileProps = { file: t.ManifestFile; style?: CssValue };

export const File: React.FC<FileProps> = (props) => {
  const { file } = props;
  const styles = {
    base: css({ Flex: 'horizontal-center-start' }),
    icon: css({ opacity: 0.3, marginRight: 12, marginTop: -2 }),
    dir: css({ opacity: 0.4 }),
    filename: css({}),
  };

  const index = file.path.lastIndexOf('/');
  const dir = index < 0 ? '' : file.path.substring(0, index + 1);
  const filename = index < 0 ? file.path : file.path.substring(index + 1);

  return (
    <div {...css(styles.base, props.style)}>
      <Icons.File size={14} style={styles.icon} color={COLORS.DARK} />
      {dir && <div {...styles.dir}>{dir}</div>}
      <div {...styles.filename}>{filename}</div>
    </div>
  );
};
