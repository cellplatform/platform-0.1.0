import React, { useState } from 'react';

import { color, css, rx, t } from '../common';
import { ActionsHost } from '../components/Host';
import { ActionsSelect } from '../components/ActionsSelect';
import * as sample1 from './sample-1/Component.DEV';
import * as sample2 from './sample-2/Component.DEV';

const bus = rx.bus();

bus.event$.subscribe((e) => {
  console.log('e', e);
});

export const Dev: React.FC = () => {
  const [selectedActions, setSelectedActions] = useState<t.DevActions<any>>(sample1.actions);

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    main: css({
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
      Absolute: [100, 50, 100, 50],
      border: `solid 5px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
    }),
    select: {
      outer: css({ Absolute: [null, null, 20, 20], width: 200 }),
    },
  };

  const elActionsList = selectedActions.renderList(bus, {
    scrollable: true, // default: true
    style: { flex: 1 },
  });

  const elSelect = (
    <ActionsSelect
      bus={bus}
      style={styles.select.outer}
      menuPlacement={'top'}
      selected={selectedActions}
      actions={[sample1.actions, sample2.actions]}
      onChange={(e) => setSelectedActions(e.selected)}
    />
  );

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.main}>
          <ActionsHost bus={bus} actions={selectedActions} style={styles.host} />
          {elSelect}
        </div>
        <div {...styles.right}>{elActionsList}</div>
      </div>
    </React.StrictMode>
  );
};
