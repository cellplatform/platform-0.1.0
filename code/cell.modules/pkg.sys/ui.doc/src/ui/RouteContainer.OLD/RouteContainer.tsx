import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, useResizeObserver, Button, Icons } from './common';
import { Doc } from '../Doc';

export type RouteContainerProps = {
  defs: t.DocDef[];
  style?: CssValue;
  onResize?: (e: { size: t.DomRect }) => void;
};

export const RouteContainer: React.FC<RouteContainerProps> = (props) => {
  const { defs = [] } = props;

  const resize = useResizeObserver({ onSize: (size) => props.onResize?.({ size }) });
  const ready = resize.ready;

  const [selectedPath, setSelectedPath] = useState<string>();
  const selectedDef = defs.find((def) => def.path === selectedPath);

  /**
   * Handlers
   */
  const handleHeadlineSelect = (def: t.DocDef) => {
    setSelectedPath(def.path);
  };

  const handleCloseHeadline = () => {
    setSelectedPath(undefined);
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: COLORS.RED,
      opacity: ready ? 1 : 0,
      transition: `opacity 150ms`,
    }),
    body: {
      base: css({
        Absolute: 18,
        backgroundColor: COLORS.BG,
        overflow: 'hidden',
        display: 'flex',
      }),
    },
    index: {
      outer: css({ Absolute: 0, display: 'flex', backgroundColor: COLORS.BG }),
      inner: css({ flex: 1 }),
    },
    document: {
      outer: css({ Absolute: 0, display: 'flex', backgroundColor: COLORS.BG }),
      inner: css({ flex: 1 }),
    },
    closeButton: {
      base: css({ Absolute: [25, 25, null, null] }),
    },
  };

  const elDocument = selectedDef && (
    <div {...styles.document.outer}>
      <Doc.Blocks
        blocks={Doc.toBlockElements({ def: selectedDef, width: 720 })}
        style={styles.document.inner}
        padding={{ header: 80, footer: 150 }}
      />
    </div>
  );

  const elIndex = Array.isArray(defs) && (
    <div {...styles.index.outer}>
      <Doc.Index
        items={defs}
        style={styles.index.inner}
        onSelectItem={(e) => handleHeadlineSelect(e.def)}
      />
    </div>
  );

  const elBody = ready && (
    <div {...styles.body.base}>
      {elIndex}
      {elDocument}
    </div>
  );

  const elCloseButton = ready && selectedPath && (
    <Button style={styles.closeButton.base} onClick={handleCloseHeadline}>
      <Icons.Close color={Color.alpha(COLORS.DARK, 0.6)} size={24} />
    </Button>
  );

  return (
    <div ref={resize.ref} {...css(styles.base, props.style)}>
      {elBody}
      {elCloseButton}
    </div>
  );
};
