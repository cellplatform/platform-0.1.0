import * as React from 'react';
import { color, css } from '../common';
import { Text } from '..';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export const Test = () => {
  const styles = {
    base: css({ padding: 30 }),
  };

  return (
    <div {...styles.base}>
      <Text>
        Default. <br />
        {LOREM}
      </Text>
      <Hr />
      <Text fontWeight={'LIGHT'}>
        fontWeight: LIGHT <br />
        {LOREM}
      </Text>
      <Hr />
      <Text fontWeight={'NORMAL'}>
        fontWeight: NORMAL <br />
        {LOREM}
      </Text>
      <Hr />
      <Text fontWeight={'BOLD'}>
        fontWeight: BOLD <br />
        {LOREM}
      </Text>
    </div>
  );
};

const Hr = () => {
  const styles = {
    base: css({
      border: 'none',
      borderTop: `solid 1px ${color.format(-0.1)}`,
      MarginY: 30,
    }),
  };
  return <hr {...styles.base} />;
};
