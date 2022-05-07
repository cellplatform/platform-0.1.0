import React from 'react';

import { COLORS, css, CssValue, FC, Spinner, Style, t } from './common';
import { usePathListState } from './hooks/usePathListState';
import { PathListItem } from './ui/PathItem';

/**
 * Types
 */
export type PathListProps = {
  files?: t.ManifestFile[];
  scroll?: boolean;
  spinning?: boolean;
  padding?: t.CssEdgesInput;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<PathListProps> = (props) => {
  const { scroll = true, files = [], spinning } = props;
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
        ...Style.toPadding(props.padding),
      }),
    },
    empty: {
      base: css({
        Flex: 'center-center',
        opacity: 0.3,
        fontSize: 12,
        fontStyle: 'italic',
        padding: 12,
      }),
    },
    spinner: {
      base: css({ Flex: 'center-center', padding: 8 }),
    },
  };

  const elSpinner = spinning && (
    <div {...styles.spinner.base}>
      <Spinner color={COLORS.DARK} size={18} />
    </div>
  );

  const elEmpty = isEmpty && !elSpinner && <div {...styles.empty.base}>No files to display</div>;

  const elList =
    !elSpinner &&
    !elEmpty &&
    files.map((file, i) => {
      const key = `${i}.${file.filehash}`;
      return <PathListItem key={key} file={file} />;
    });

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        {elSpinner}
        {elEmpty}
        {elList}
      </div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  useState: typeof usePathListState;
};
export const PathList = FC.decorate<PathListProps, Fields>(
  View,
  { useState: usePathListState },
  { displayName: 'PathList' },
);
