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
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>{file.path}</div>
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
