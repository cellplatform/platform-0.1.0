import React, { useEffect, useState } from 'react';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Bullet } from '../../Bullet';
import { color, COLORS, CONSTANTS, css, CssValue, t, time } from '../common';
import { CountLabel } from './Label.Count';
import { TypeLabel } from './Label.Type';

const { ROW } = CONSTANTS;
type D = t.EventHistoryItem;
type Milliseconds = number;

export type EventListRowProps = {
  index: number;
  data: D;
  is: { first: boolean; last: boolean; selected: boolean; down: boolean };
  recentThreshold?: Milliseconds;
  style?: CssValue;
  onClick?: (e: { index: number; data: D }) => void;
};

export const EventListRow: React.FC<EventListRowProps> = (props) => {
  const { index, data, is, recentThreshold = 800 } = props;
  const timestamp = data.timestamp;

  const [isRecent, setIsRecent] = useState(Util.isRecent(timestamp, recentThreshold));

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const dispose$ = new Subject<void>();
    if (isRecent) {
      interval(300)
        .pipe(takeUntil(dispose$))
        .subscribe(() => {
          const next = Util.isRecent(timestamp, recentThreshold);
          setIsRecent(next);
        });
    }
    return () => dispose$.next();
  }, [index, timestamp, recentThreshold, isRecent]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      height: ROW.HEIGHT,
      fontSize: 12,
    }),
    body: css({
      Flex: 'x-stretch-center',
      boxSizing: 'border-box',
      paddingRight: 15,
      transform: is.down ? `translateY(1px)` : undefined,
    }),
    dot: {
      base: css({ Flex: 'y-center-center', marginRight: 6 }),
      inner: css({
        Size: 4,
        borderRadius: 10,
        backgroundColor: color.alpha(COLORS.MAGENTA, isRecent ? 0.7 : 0),
        transition: `background-color 300ms`,
      }),
    },
    label: css({ flex: 1 }),
    right: css({}),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div {...styles.dot.base}>
          <Bullet
            size={6}
            body={{
              radius: 15,
              borderColor: color.alpha(COLORS.DARK, 0.3),
              backgroundColor: 1,
            }}
          >
            <div {...styles.dot.inner} />
          </Bullet>
        </div>
        <TypeLabel
          text={data.event.type}
          style={styles.label}
          onClick={(e) => props.onClick?.({ index, data })}
        />
        <CountLabel count={data.count} style={styles.right} />
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */

const Util = {
  isRecent(timestamp: Milliseconds, threshold: Milliseconds) {
    const now = time.now.timestamp;
    return now - timestamp < threshold;
  },
};
