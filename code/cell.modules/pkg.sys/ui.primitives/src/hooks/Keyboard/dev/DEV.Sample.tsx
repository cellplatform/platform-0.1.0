import React, { useEffect } from 'react';
import { Subject } from 'rxjs';

import { useKeyboardPipe, KeyboardPipeHookArgs } from '..';

import { color, COLORS, Card, css, CssValue, TextSyntax, Icons } from './DEV.common';
import { DevModifierKeys } from './DEV.ModifierKeys';

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
    base: css({ Flex: 'y-stretch-stretch', boxSizing: 'border-box', position: 'relative' }),
    body: {
      base: css({
        position: 'relative',
        flex: 1,
        Flex: 'center-center',
      }),
    },
    footer: {
      base: css({ Flex: 'x-spaceBetween-center', padding: 10 }),
    },

    keyboard: {
      icon: css({ Absolute: [0, null, null, 18] }),
    },
  };

  const elIcon = (
    <Icons.Keyboard.fill
      size={60}
      color={color.alpha(COLORS.DARK, 0.3)}
      style={styles.keyboard.icon}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        <div />
        {elIcon}
      </div>
      <div {...styles.footer.base}>
        <DevModifierKeys align={'left'} />
        <DevModifierKeys align={'right'} />
      </div>
    </div>
  );
};
