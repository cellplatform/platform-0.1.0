import React, { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css } from '../../common';
import { Host } from '../../components/Host';
import { actions } from './Dev.actions';

export const Dev: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const model = actions.toContext().model;
  const position = model.state.position;

  useEffect(() => {
    const dispose$ = new Subject();
    model.event.changed$.pipe(takeUntil(dispose$)).subscribe((e) => setCount(count + 1));
    return () => dispose$.next();
  });

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    left: css({
      position: 'relative',
      flex: 1,
    }),
    right: css({
      display: 'flex',
      position: 'relative',
      width: 300,
      backgroundColor: color.format(-0.03),
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
    host: css({
      Absolute: 50,
      border: `solid 5px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
    }),
    content: css({
      padding: 20,
    }),
  };

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          <Host
            style={styles.host}
            background={-0.04}
            layout={{
              width: 550,
              border: -0.1,
              cropmarks: -0.2,
              background: 1,
              position: position ? { absolute: position } : undefined,
              // label: {
              //   topLeft: 'top-left',
              //   topRight: 'top-right',
              //   bottomLeft: 'bottom-left',
              //   bottomRight: 'bottom-right',
              // },
              label: 'foobar',
            }}
          >
            <div {...styles.content}>
              {count}. {model.state.text}
            </div>
          </Host>
        </div>
        <div {...styles.right}>{actions.render({ style: { flex: 1 } })}</div>
      </div>
    </React.StrictMode>
  );
};
