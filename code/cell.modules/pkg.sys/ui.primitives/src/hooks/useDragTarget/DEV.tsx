import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { useDragTarget } from '.';
import { color, css } from '../../common';
import { Button } from '../../components.ref/button/Button';

type Ctx = {
  count: number;
};
const INITIAL = { count: 0 };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hooks/useDragTarget')
  .context((prev) => prev || INITIAL)

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: {
          topLeft: 'hook: useDragTarget',
          topRight: 'hint: drag a file over the target',
        },
        position: [250, 150],
      },
      host: { background: -0.04 },
      actions: { width: 0 },
    });

    e.render(<Sample />);
  });

export const Sample: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const dragTarget = useDragTarget(ref);

  const styles = {
    base: css({
      Absolute: 0,
      padding: 30,
    }),
    toolbar: css({
      marginBottom: 20,
      // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      paddingBottom: 10,
      borderBottom: `solid 1px ${color.format(-0.1)}`,
    }),
    dragOver: css({
      Absolute: 0,
      Flex: 'center-center',
      pointerEvents: 'none',
    }),
  };

  const elDragOver = dragTarget.isDragOver && (
    <div {...styles.dragOver}>
      <div>Drop File</div>
    </div>
  );

  const elToolbar = (
    <div {...styles.toolbar}>
      <Button onClick={() => dragTarget.reset()}>Reset</Button>
    </div>
  );

  const { isDragOver, dropped } = dragTarget;
  const data = { isDragOver, dropped };

  return (
    <div ref={ref} {...styles.base}>
      {elToolbar}
      <ObjectView name={'debug'} data={data} expandLevel={10} />
      {elDragOver}
    </div>
  );
};

export default actions;
