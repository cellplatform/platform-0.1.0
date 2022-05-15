import React from 'react';

import { Fullscreen } from '..';
import { Button, Color, css, CssValue, t } from '../common';

export type DevSampleProps = {
  instance?: t.FullscreenInstance;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { instance } = props;
  const fullscreen = Fullscreen.useFullscreen({
    instance,
    onChanged(e) {
      console.log('-------------------------------------------');
      console.log('⚡️ onChanged', e);
      console.log('fullscreen', fullscreen.isFullscreen);
    },
  });

  /**
   * Handlers
   */
  const handleExitViaBus = async () => {
    if (instance) {
      const events = Fullscreen.Events({ instance });
      await events.exit.fire();
      events.dispose();
    }
  };

  /**
   * [Render]
   */
  const styles = {
    base: css({
      backgroundColor: Color.format(1),
      Flex: 'center-center',
    }),
    body: css({
      width: 300,
      padding: 20,
      backgroundColor: Color.format(-0.06),
      border: `dashed 1px ${Color.format(-0.1)}`,
      borderRadius: 5,
      lineHeight: '2em',
    }),
  };

  return (
    <div ref={fullscreen.ref} {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <Button onClick={fullscreen.enter} block={true}>
          Enter Full Screen
        </Button>
        <Button onClick={fullscreen.exit} block={true}>
          Exit Full Screen
        </Button>
        <Button onClick={handleExitViaBus} block={true}>
          Exit Full Screen (EventBus)
        </Button>
      </div>
    </div>
  );
};
