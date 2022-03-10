import React, { useEffect } from 'react';
import { Subject } from 'rxjs';

import { useKeyboardPipe, KeyboardPipeHookArgs } from '..';

import { color, COLORS, Card, css, CssValue, TextSyntax, Icons } from './DEV.common';

export type EventCtx = { index: number; message: string };

export type DevSampleProps = {
  args: KeyboardPipeHookArgs;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const keyboard = useKeyboardPipe(props.args);

  /**
   * NOTE: Test multiple instances of the hook initiated.
   *       Should not duplicate keyboard events.
   */
  useKeyboardPipe(props.args);
  useKeyboardPipe(props.args);

  useEffect(() => {
    const dispose$ = new Subject<void>();
    const events = keyboard.events({ dispose$ });
    events.$.subscribe((e) => {
      // console.log('keyboard (inside hook)', e);
    });

    return () => dispose$.next();
  }, []); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      Flex: 'center-center',
    }),
    card: css({ padding: 20 }),
    label: css({ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }),
    keyboard: {
      icon: css({ Absolute: [0, null, null, 18] }),
    },
  };

  const elCard = (
    <div>
      <Card style={styles.card}>
        <TextSyntax text={'<Keyboard>'} style={styles.label} />
      </Card>
    </div>
  );

  const elIcon = (
    <Icons.Keyboard.fill
      size={60}
      color={color.alpha(COLORS.DARK, 0.5)}
      style={styles.keyboard.icon}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elCard}
      {elIcon}
    </div>
  );
};
