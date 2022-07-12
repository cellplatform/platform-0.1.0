import React from 'react';

import { DocLayoutContainer } from '../Doc.LayoutContainer';
import { css, CssValue, t } from './common';
import { IndexList } from './ui/List';

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
      debug={props.debug}
      onResize={props.onResize}
      style={css(styles.base, props.style)}
    >
      <IndexList items={items} onSelect={props.onSelect} style={styles.list} />
    </DocLayoutContainer>
  );
};
