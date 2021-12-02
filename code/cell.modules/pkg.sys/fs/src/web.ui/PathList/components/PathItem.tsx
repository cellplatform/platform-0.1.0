import React from 'react';
import { color, css, CssValue, t, HashChip, Filesize } from '../common';

export type PathListItemProps = {
  file: t.ManifestFile;
  style?: CssValue;
};

export const PathListItem: React.FC<PathListItemProps> = (props) => {
  const { file } = props;
  const size = Filesize(file.bytes, { round: 1, spacer: '' });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'horizontal-stretch-spaceBetween',
      position: 'relative',
      boxSizing: 'border-box',
      padding: 4,
      fontSize: 12,
      borderBottom: `solid 1px ${color.format(-0.06)}`,
    }),
    path: css({
      flex: 1,
      position: 'relative',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      paddingTop: 1,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.path}>{file.path}</div>
      <div>
        <HashChip
          text={file.filehash}
          icon={true}
          prefix={size}
          clipboard={(e) => `${file.path}#${e.hash}`}
        />
      </div>
    </div>
  );
};
