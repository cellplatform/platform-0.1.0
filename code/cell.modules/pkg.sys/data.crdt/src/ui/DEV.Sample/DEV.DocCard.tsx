import React, { useEffect, useState } from 'react';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ObjectView } from 'sys.ui.dev';
import { Button } from 'sys.ui.primitives/lib/ui.ref/button/Button';
import { Card } from 'sys.ui.primitives/lib/ui/Card';

import { Automerge, Color, COLORS, css, CssValue, Filesystem, rx, t } from './common';
import { SimpleDoc } from './DEV.types';

export type DocCardProps = {
  instance: t.FsViewInstance;
  index: number;
  doc: t.CrdtDocEvents<SimpleDoc>;
  width?: number;
  style?: CssValue;
};

export const DocCard: React.FC<DocCardProps> = (props) => {
  const { doc, width = 180, index } = props;
  const [current, setCurrent] = useState<SimpleDoc>(doc.current);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const { dispose, dispose$ } = rx.disposable();

    const store = Filesystem.Events({
      bus: props.instance.bus,
      id: props.instance.fs,
      timeout: 1200,
      dispose$,
    });
    const changed$ = props.doc.changed$.pipe(takeUntil(dispose$));

    /**
     * Update local state when the document has been updated.
     */
    changed$.pipe(debounceTime(50)).subscribe((e) => setCurrent(e.doc.next as SimpleDoc));

    /**
     * Save
     */
    changed$.pipe(debounceTime(1000)).subscribe(async (e) => {
      const doc = e.doc.next as SimpleDoc;
      const path = `file-${index}.crdt`;
      const file = Automerge.save(doc);
      await store.fs('sample').write(path, file);
    });

    return dispose;
  }, [props.doc, index]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      width,
      padding: 5,
      fontSize: 13,
    }),
    object: css({ margin: 5 }),
    toolbar: css({
      marginTop: 15,
      padding: 5,
      Flex: 'horizontal-stretch-spaceBetween',
      borderTop: `solid 1px ${Color.format(-0.1)}`,
    }),
    count: css({
      Absolute: [-33, 0, 0, 0],
      height: 20,
      color: Color.alpha(COLORS.DARK, 0.3),
      Flex: 'center-center',
      fontFamily: 'monospace',
      fontWeight: 'bold',
      fontSize: 32,
    }),
  };
  return (
    <Card style={css(styles.base, props.style)}>
      <div {...styles.count}>{doc.current.count}</div>
      <ObjectView data={current} style={styles.object} />
      <div {...styles.toolbar}>
        <Button
          onClick={() => {
            try {
              console.log('click', doc);
              doc.change((d) => d.count++);
            } catch (error) {
              console.log('error', error);
            }
          }}
        >
          Increment
        </Button>
        <Button onClick={() => doc.change((d) => d.count--)}>Decrement</Button>
      </div>
    </Card>
  );
};
