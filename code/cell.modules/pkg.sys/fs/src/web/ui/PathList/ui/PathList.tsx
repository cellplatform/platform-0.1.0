import React, { useRef, useState } from 'react';

import { COLORS, Color, css, DEFAULT, List, Spinner, Style, t, time } from '../common';
import { PathListProps } from '../types';
import { wrangle } from './wrangle';
import { DropTarget } from './DropTarget';
import { Row } from './PathList.Row';
import { renderers } from './renderers';

/**
 * Component
 */
export const PathList: React.FC<PathListProps> = (props) => {
  const { instance, scroll = true, files = [], spinning, theme = DEFAULT.THEME } = props;
  const total = files.length;
  const isEmpty = total === 0;
  const isLight = theme === 'Light';

  const targetRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setDragOver] = useState(false);

  const list: t.ListProps = {
    instance: props.instance,
    renderers,
    orientation: 'y',
    bullet: { edge: 'near', size: 12 },
    tabIndex: wrangle.tabIndex(props),
  };

  const dynamic = List.useDynamicState({
    total,
    props: list,
    selection: props.selection,
  });

  /**
   * TODO 🐷
   * Fire events from here (via dynamic) state:
   *
   * - onSelection
   * - onKeypress
   */

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

  const toData = (file: t.ManifestFile): t.PathListItemData => ({ file, theme });
  const ListView = {
    simple() {
      const items = files.map((file) => ({ data: toData(file) }));
      return <List.Layout {...list} items={items} state={dynamic.state} style={styles.list} />;
    },
    virtual() {
      const getData: t.GetListItem = (index) => ({ data: toData(files[index]) });
      const getSize: t.GetListItemSize = () => Row.height;
      const items = { total, getData, getSize };
      return <List.Virtual {...list} items={items} state={dynamic.state} style={styles.list} />;
    },
    render() {
      return scroll ? ListView.virtual() : ListView.simple();
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
