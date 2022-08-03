import React, { useEffect } from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import {
  Button,
  color,
  css,
  CssValue,
  defaultValue,
  events,
  Icons,
  t,
  COLORS,
} from '../DEV.common';

export type DevModalProps = {
  children?: React.ReactNode;
  bus: t.EventBus<any>;
  closeOnEscape?: boolean;
  background?: string | number;
  style?: CssValue;
};

export const DevModal: React.FC<DevModalProps> = (props) => {
  const bus = props.bus as t.EventBus<t.DevEvent>;
  const closeOnEscape = defaultValue(props.closeOnEscape, true);

  const closeModal = () => bus.fire({ type: 'DEV/modal', payload: {} });

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const key$ = events.keyPress$.pipe(
      takeUntil(dispose$),
      filter((e) => e.isPressed),
    );

    key$
      .pipe(
        filter((e) => e.key === 'Escape'),
        filter((e) => closeOnEscape),
      )
      .subscribe(closeModal);

    return () => dispose$.next();
  });

  const SIZE = { CLOSE: 32 };
  const styles = {
    base: css({
      Absolute: 0,
      backgroundColor: color.format(props.background),
      display: 'flex',
    }),
    close: css({ Absolute: [5, 5, null, null], Size: SIZE.CLOSE }),
  };

  const elClose = (
    <Button
      style={styles.close}
      onClick={closeModal}
      tooltip={closeOnEscape ? 'Escape' : undefined}
    >
      <Icons.Close
        size={SIZE.CLOSE}
        color={color.format(0.8)}
        style={css({ Absolute: [1, null, null, 0] })}
      />
      <Icons.Close
        size={SIZE.CLOSE}
        color={color.alpha(COLORS.DARK, 0.6)}
        style={css({ Absolute: 0 })}
      />
    </Button>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {props.children}
      {elClose}
    </div>
  );
};
