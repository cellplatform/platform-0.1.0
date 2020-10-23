import * as React from 'react';
import { Host } from '../components/Host';
import { color, css } from '../common';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export const App: React.FC = () => {
  const styles = {
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
      <Host
        style={styles.host}
        background={-0.04}
        layout={{
          width: 550,
          border: -0.1,
          cropmarks: -0.2,
          background: 1,
          // label: {
          //   topLeft: 'top-left',
          //   topRight: 'top-right',
          //   bottomLeft: 'bottom-left',
          //   bottomRight: 'bottom-right',
          // },
          label: 'foobar',
        }}
      >
        <div {...styles.content}>{LOREM}</div>
      </Host>
    </React.StrictMode>
  );
};
