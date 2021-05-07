import React, { useEffect, useRef, useState } from 'react';

import { color, css, CssValue, ObjectView, t } from '../common';
import { DevEvents } from '../event';

export type DevScreensizeProps = {
  bus: t.EventBus<any>;
  netbus: t.NetBus<any>;
  style?: CssValue;
};

export const DevScreensize: React.FC<DevScreensizeProps> = (props) => {
  const bus = props.bus.type<t.DevEvent>();
  const netbus = props.bus.type<t.DevEvent>();

  const baseRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<t.DevModel | undefined>();

  useEffect(() => {
    const events = DevEvents(bus);
    const local$ = events.$;

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
    }),
    body: css({
      marginTop: 20,
    }),
  };

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <div>screen size</div>
      <div {...styles.body}>
        <ObjectView name={'model'} data={model} expandLevel={5} />
      </div>
    </div>
  );
};
