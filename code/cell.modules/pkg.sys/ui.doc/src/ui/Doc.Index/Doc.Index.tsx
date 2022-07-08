import React from 'react';

import { DocLayoutContainer } from '../Doc.LayoutContainer';
import { css, CssValue, t } from './common';
import { DocIndexList } from './Doc.Index.List';

export type DocIndexProps = {
  items?: t.DocDef[];
  debug?: boolean;
  style?: CssValue;
  onResize?: t.DocResizeHandler;
  onSelect?: t.DocIndexSelectHandler;
};

export const DocIndex: React.FC<DocIndexProps> = (props) => {
  const { items = [] } = props;

  const styles = {
    base: css({}),
    list: css({ flex: 1 }),
  };

  return (
    <DocLayoutContainer
      style={css(styles.base, props.style)}
      debug={props.debug}
      onResize={props.onResize}
    >
      <DocIndexList items={items} onSelect={props.onSelect} style={styles.list} />
    </DocLayoutContainer>
  );
};
