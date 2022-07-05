import React, { useState } from 'react';

import { DocBlocks } from '../Doc.Blocks';
import { DocLayoutContainer } from '../Doc.LayoutContainer';
import { toBlockElements } from '../Doc/Doc.toBlocks';
import { css, CssValue, t } from './common';

export type DocLayoutProps = {
  def?: t.DocDef;

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

  const width = sizes?.column.width;
  const blocks = def && width && toBlockElements({ def, width });

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

  return (
    <DocLayoutContainer style={props.style} onResize={handleResize}>
      {blocks && (
        <DocBlocks
          style={styles.blocks}
          blocks={blocks}
          tracelines={props.tracelines}
          padding={padding}
          blockSpacing={props.blockSpacing}
          onBlockClick={props.onBlockClick}
        />
      )}
    </DocLayoutContainer>
  );
};
