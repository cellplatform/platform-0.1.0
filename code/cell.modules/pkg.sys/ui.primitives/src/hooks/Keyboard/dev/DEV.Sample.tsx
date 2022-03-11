import React, { useEffect } from 'react';
import { Subject } from 'rxjs';

import { Keyboard, KeyboardPipeHookArgs } from '..';
import { color, COLORS, css, CssValue, Icons } from './DEV.common';
import { DevModifierKeys } from './DEV.ModifierKeys';

export type EventCtx = { index: number; message: string };

export type DevSampleProps = {
  args: KeyboardPipeHookArgs;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const keyboard = Keyboard.useKeyboard(props.args);

  /**
   * NOTE: Test multiple instances of the hook initiated.
   *       Should not duplicate keyboard events.
   */
  Keyboard.useKeyboardPipe(props.args);
  Keyboard.useKeyboardPipe(props.args);

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
      Flex: 'y-stretch-stretch',
      boxSizing: 'border-box',
      position: 'relative',
    }),
    body: css({ flex: 1, position: 'relative', Flex: 'center-center' }),
    footer: css({ Flex: 'x-spaceBetween-center', padding: 10 }),
    icon: css({ Absolute: [0, null, null, 12] }),
    keys: css({ Flex: 'x-center-center' }),
    key: {
      base: css({
        Flex: 'y-center-center',
        position: 'relative',
        color: COLORS.DARK,
        marginRight: 10,
        ':last-child': { margin: 0 },
      }),
      label: css({ fontSize: 50 }),
      code: css({ fontSize: 9, paddingTop: 5 }),
    },
  };

  const elIcon = (
    <Icons.Keyboard.fill size={42} color={color.alpha(COLORS.DARK, 0.3)} style={styles.icon} />
  );

  const elKeys = (
    <div {...styles.keys}>
      {keyboard.current.pressed.map((e, i) => {
        return (
          <div key={`${e.code}.${i}`} {...styles.key.base}>
            <div {...styles.key.label}>{e.key}</div>
            <div {...styles.key.code}>{e.code}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {elKeys}
        {elIcon}
      </div>
      <div {...styles.footer}>
        <DevModifierKeys edge={'Left'} state={keyboard.current} />
        <DevModifierKeys edge={'Right'} state={keyboard.current} />
      </div>
    </div>
  );
};
