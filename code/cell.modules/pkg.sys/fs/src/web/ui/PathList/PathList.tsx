import React from 'react';

import { COLORS, css, CssValue, FC, List, Spinner, Style, t } from './common';
import { usePathListState } from './logic/usePathListState';
import { renderers } from './ui/renderers';
import { Row } from './ui/Row';

/**
 * Types
 */
export type PathListProps = {
  instance?: { bus: t.EventBus<any>; id: string };
  files?: t.ManifestFile[];
  scroll?: boolean;
  spinning?: boolean;
  padding?: t.CssEdgesInput;
  selection?: t.ListSelectionConfig | boolean;
  tabIndex?: number;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<PathListProps> = (props) => {
  const { scroll = true, files = [], spinning } = props;
  const total = files.length;
  const isEmpty = total === 0;

  const list: t.ListProps = {
    instance: props.instance,
    renderers,
    orientation: 'y',
    bullet: { edge: 'near', size: 12 },
    tabIndex: wrangleTabIndex(props),
  };

  const dynamic = List.useDynamicState({
    total,
    props: list,
    selection: props.selection,
  });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      userSelect: 'none',
      Flex: 'y-stretch-stretch',
      ...Style.toPadding(props.padding),
    }),
    empty: css({
      Flex: 'center-center',
      opacity: 0.3,
      fontSize: 12,
      fontStyle: 'italic',
      padding: 12,
    }),
    spinner: css({ Flex: 'center-center', padding: 8 }),
    list: { marginLeft: 5, flex: 1 },
  };

  const elSpinner = spinning && (
    <div {...styles.spinner}>
      <Spinner color={COLORS.DARK} size={18} />
    </div>
  );

  const elEmpty = isEmpty && !elSpinner && <div {...styles.empty}>No files to display</div>;

  const toSimpleList = (files: t.ManifestFile[]) => {
    const items = files.map((file) => ({ data: file }));
    return <List.Layout {...list} items={items} state={dynamic.state} style={styles.list} />;
  };

  const toVirtualList = (files: t.ManifestFile[]) => {
    const getData: t.GetListItem = (index) => ({ data: files[index] });
    const getSize: t.GetListItemSize = (e) => Row.height;
    const items = { total, getData, getSize };
    return <List.Virtual {...list} items={items} state={dynamic.state} style={styles.list} />;
  };

  const elList = !elSpinner && !elEmpty && (scroll ? toVirtualList(files) : toSimpleList(files));

  return (
    <div {...css(styles.base, props.style)}>
      {elSpinner}
      {elEmpty}
      {elList}
    </div>
  );
};

/**
 * Helpers
 */
function wrangleTabIndex(props: PathListProps) {
  if (typeof props.tabIndex === 'number') return props.tabIndex;
  if (List.wrangle.selection(props.selection).keyboard) return -1;
  return undefined;
}

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
