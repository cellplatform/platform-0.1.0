import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from './common';
import { PathListItem } from './components/PathItem';

export type PathListProps = {
  files?: t.ManifestFile[];
  scroll?: boolean;
  spinning?: boolean;
  style?: CssValue;
};

export const PathList: React.FC<PathListProps> = (props) => {
  const { scroll = true, files = [] } = props;
  const isEmpty = files.length === 0;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      userSelect: 'none',
    }),
    body: {
      base: css({
        Scroll: scroll,
        Absolute: scroll ? 0 : undefined,
      }),
    },
    empty: css({
      Flex: 'center-center',
      opacity: 0.3,
      fontSize: 12,
      fontStyle: 'italic',
      padding: 12,
    }),
  };

  const elEmpty = isEmpty && <div {...styles.empty}>No files to display</div>;

  const elList = files.map((file, i) => {
    const key = `${i}.${file.filehash}`;
    return <PathListItem key={key} file={file} />;
  });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        {elEmpty}
        {elList}
      </div>
    </div>
  );
};
