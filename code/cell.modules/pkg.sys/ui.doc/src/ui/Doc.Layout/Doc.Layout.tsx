import React, { useEffect, useRef, useState } from 'react';
import { Subject } from 'rxjs';

import { DocBlocks } from '../Doc.Blocks';
import { DocLayoutContainer, DocLayoutScrollTop } from '../Doc.LayoutContainer';
import { toBlockElements } from '../Doc/Doc.toBlocks';
import { css, CssValue, t } from './common';

export type DocLayoutProps = {
  def?: t.DocDef;

  scrollable?: boolean;
  tracelines?: boolean;
  padding?: t.DocBlocksPadding;
  blockSpacing?: t.DocBlocksSpacing;
  style?: CssValue;

  onBlockClick?: t.DocBlocksClickHandler;
  onResize?: t.DocResizeHandler;
};

export const DocLayout: React.FC<DocLayoutProps> = (props) => {
  const { def, padding = { header: 60, footer: 80 } } = props;
  const [sizes, setSizes] = useState<t.DocLayoutSizes>();

  const contentHash = def ? `${def.id}.${def.blocks?.length ?? 0}` : '';
  const width = sizes?.column.width;
  const blocks = def && width && toBlockElements({ def, width });
  const scrollTopRef$ = useRef(new Subject<DocLayoutScrollTop>());

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    // When the content changes, ensure the document is scrolled to the top.
    scrollTopRef$.current.next({ top: 0 });
  }, [contentHash]);

  /**
   * [Handlers]
   */
  const handleResize: t.DocResizeHandler = (e) => {
    setSizes(e.sizes);
    props.onResize?.(e);
  };

  /**
   * [Render]
   */
  const styles = {
    blocks: css({ flex: 1 }),
  };

  const elBlocks = blocks && (
    <DocBlocks
      style={styles.blocks}
      blocks={blocks}
      padding={padding}
      tracelines={props.tracelines}
      blockSpacing={props.blockSpacing}
      onBlockClick={props.onBlockClick}
    />
  );

  return (
    <DocLayoutContainer
      style={props.style}
      scrollable={props.scrollable}
      scrollTop$={scrollTopRef$.current}
      onResize={handleResize}
    >
      {elBlocks}
    </DocLayoutContainer>
  );
};
