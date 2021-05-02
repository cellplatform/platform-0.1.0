import React, { useState, useRef } from 'react';

import { MotionDraggable, MotionDraggableItem, MotionDraggableProps } from '..';
import { css, useEventListener, CssValue, color } from '../common';
import { useScale } from '../hooks';

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

  const items: MotionDraggableItem[] = [
    { width: 100, height: 100, el: <Child>Foo-1</Child> },
    {
      width: () => 200,
      height: () => 80,
      el() {
        return <Child>Foo-2</Child>;
      },
      scaleable: true,
    },
  ];

  return (
    <div {...styles.base}>
      <div {...styles.bg} onClick={handleBgClick}>{`background click: ${count}`}</div>
      <MotionDraggable {...props} style={{ flex: 1 }} items={items} />
    </div>
  );
};

/**
 * Sample item (child).
 */
export type ChildProps = { style?: CssValue };

export const Child: React.FC<ChildProps> = (props) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const styles = {
    base: css({
      flex: 1,
      padding: 20,
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      borderRadius: 20,
    }),
  };
  return (
    <div ref={rootRef} {...css(styles.base, props.style)}>
      {props.children}
    </div>
  );
};
