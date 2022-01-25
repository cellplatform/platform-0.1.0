import React, { useEffect, useRef, useState } from 'react';

import { COLORS, color, css, CssValue, ObjectView, t } from '../DEV.common';
import { DevEvents } from '../DEV.event';

export type DevScreensizeProps = {
  bus: t.EventBus<any>;
  netbus: t.PeerNetbus<any>;
  style?: CssValue;
};

export const DevScreensize: React.FC<DevScreensizeProps> = (props) => {
  const bus = props.bus as t.EventBus<t.DevEvent>;

  const baseRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<t.DevModel | undefined>();

  useEffect(() => {
    const events = DevEvents(bus);

    const update = async () => {
      const model = await events.model.get();
      console.log('update');
      console.log('model', model);
      setModel(model.state);
    };

    events.model.changed$.subscribe(update);

    update();

    return () => events.dispose();
  }, []); // eslint-disable-line

  const styles = {
    base: css({
      flex: 1,
      padding: 30,
      backdropFilter: `blur(8px)`,
      backgroundColor: color.format(0.5),
      display: 'flex',
    }),
    body: {
      base: css({
        marginTop: 20,
        Flex: 'horizontal-stretch-stretch',
        flex: 1,
      }),
    },
    left: css({
      minWidth: 350,
    }),
    right: css({
      flex: 1,
      border: `solid 5px ${color.alpha(COLORS.MAGENTA, 0.1)}`,
      marginLeft: 10,
    }),
  };

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <div {...styles.body.base}>
        <div {...styles.left}>
          <ObjectView name={'model'} data={model} expandLevel={5} />
        </div>
        <div {...styles.right}>
          <div>screen size</div>
          <div>right</div>
        </div>
      </div>
    </div>
  );
};
