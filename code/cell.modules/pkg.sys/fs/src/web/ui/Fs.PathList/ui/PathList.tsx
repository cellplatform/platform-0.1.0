import React, { useRef, useState } from 'react';

import { Color, COLORS, css, DEFAULT, List, Spinner, Style, t, time } from '../common';
import { FsPathListProps } from '../types';
import { DropTarget } from './DropTarget';
import { Row } from './PathList.Row';
import { renderers } from './renderers';
import { wrangle } from './wrangle';

/**
 * Component
 */
export const PathList: React.FC<FsPathListProps> = (props) => {
  const { instance, scrollable: scroll = true, cursor, spinning, theme = DEFAULT.THEME } = props;
  const total = cursor.total;
  const isEmpty = total === 0;
  const isLight = theme === 'Light';

  const targetRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setDragOver] = useState(false);

  const list: t.ListProps = {
    instance,
    renderers,
    orientation: 'y',
    bullet: { edge: 'near', size: 12 },
    tabIndex: wrangle.tabIndex(props),
  };

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
      padding: 12,
      fontSize: 12,
      fontStyle: 'italic',
      color: isLight ? Color.alpha(COLORS.DARK, 0.3) : Color.format(0.3),
    }),
    spinner: css({ Flex: 'center-center', padding: 8 }),
    list: {
      flex: 1,
      marginLeft: 5,
      opacity: isDragOver ? 0.2 : 1,
      filter: `blur(${isDragOver ? 3 : 0}px)`,
      transition: `opacity 100ms, filter 100ms`,
    },
  };

  const toData = (file: t.ManifestFile): t.FsPathListItemData => ({ file, theme });
  const toListCursor = (cursor: t.FsPathListCursor): t.ListCursor => {
    const getData: t.GetListItem = (index) => ({ data: toData(cursor.getData(index)) });
    const getSize: t.GetListItemSize = () => Row.height;
    return { total: cursor.total, getData, getSize };
  };

  const ListView = {
    simple(files: t.FsPathListCursor) {
      const cursor = toListCursor(files);
      return <List.Layout {...list} items={cursor} state={props.state} style={styles.list} />;
    },

    virtual(files: t.FsPathListCursor) {
      const cursor = toListCursor(files);
      return <List.Virtual {...list} cursor={cursor} state={props.state} style={styles.list} />;
    },

    render() {
      return scroll ? ListView.virtual(cursor) : ListView.simple(cursor);
    },
  };

  const elSpinner = spinning && (
    <div {...styles.spinner}>
      <Spinner color={isLight ? COLORS.DARK : 1} size={18} />
    </div>
  );

  const elEmpty = isEmpty && !elSpinner && <div {...styles.empty}>No files to display</div>;
  const elList = !elSpinner && !elEmpty && ListView.render();

  const elDropTarget = props.droppable && (
    <DropTarget
      instance={instance}
      targetRef={targetRef}
      theme={theme}
      onDragOver={(e) => time.delay(0, () => setDragOver(e.isOver))}
      onDrop={props.onDrop}
    />
  );

  return (
    <div ref={targetRef} {...css(styles.base, props.style)}>
      {elSpinner}
      {elEmpty}
      {elList}
      {elDropTarget}
    </div>
  );
};
