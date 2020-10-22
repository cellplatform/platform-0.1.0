import * as React from 'react';
import { Host } from '../components/Host';
import { color, css } from '../common';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export const App: React.FC = () => {
  const style = {
    Absolute: 50,
    border: `solid 5px ${color.format(-0.1)}`,
    boxSizing: 'border-box',
  };
  return (
    <React.StrictMode>
      <Host style={style} layout={{ width: 500, border: 0.3, cropmarks: -0.2 }}>
        <div>{LOREM}</div>
      </Host>
    </React.StrictMode>
  );
};
