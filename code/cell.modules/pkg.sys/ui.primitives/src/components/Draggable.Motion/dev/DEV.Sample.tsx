import React, { useRef, useState } from 'react';

import { MotionDraggable, MotionDraggableDef, MotionDraggableProps } from '..';
import { color, css, CssValue } from '../common';
import { DevChild } from './DEV.Child';

/**
 * Sample.
 */
export const Sample: React.FC<MotionDraggableProps> = (props) => {
  const [count, setCount] = useState<number>(0);
  const handleBgClick = () => setCount((prev) => prev + 1);

  const styles = {
    base: css({ Absolute: 50, display: 'flex', border: `dashed 1px ${color.format(-0.1)}` }),
    bg: css({ Absolute: 0, Flex: 'center-center', userSelect: 'none', opacity: 0.3 }),
  };

  const items: MotionDraggableDef[] = [
    { id: 'foo-1', width: 100, height: 100, el: <DevChild>Foo-1</DevChild>, scaleable: true },
    {
      id: 'foo-2',
      width: () => 200,
      height: () => 200,
      el(state) {
        return <DevChild state={state} />;
      },
    },
  ];

  return (
    <div {...styles.base}>
      <div {...styles.bg} onClick={handleBgClick}>{`background click: ${count}`}</div>
      <MotionDraggable {...props} style={{ flex: 1 }} items={items} />
    </div>
  );
};
