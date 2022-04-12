import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { ObjectView } from 'sys.ui.dev';
import { Button } from 'sys.ui.primitives/lib/ui.ref/button/Button';
import { Card } from 'sys.ui.primitives/lib/ui/Card';

import { color, css, CssValue, t, COLORS } from '../../common';
import { SimpleDoc } from './DEV.types';

export type DocCardProps = {
  doc: t.CrdtDocEvents<SimpleDoc>;
  width?: number;
  style?: CssValue;
};

export const DocCard: React.FC<DocCardProps> = (props) => {
  const { doc, width = 180 } = props;
  const [current, setCurrent] = useState<SimpleDoc>(doc.current);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    const changed$ = props.doc.changed$.pipe(takeUntil(dispose$));

    // Update local state when the document has been updated.
    changed$.pipe(debounceTime(50)).subscribe((e) => setCurrent(e.doc.next as SimpleDoc));

    return () => dispose$.next();
  }, [props.doc]); // eslint-disable-line

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
      borderTop: `solid 1px ${color.format(-0.1)}`,
    }),
    count: css({
      Absolute: [-33, 0, 0, 0],
      height: 20,
      color: color.alpha(COLORS.DARK, 0.3),
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