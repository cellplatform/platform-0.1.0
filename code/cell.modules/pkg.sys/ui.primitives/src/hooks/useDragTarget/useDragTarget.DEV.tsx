import React from 'react';
import { css } from '../../common';

import { DevActions, ObjectView } from 'sys.ui.dev';
import { Button } from '../../components.ref/button/Button';
import { useDragTarget } from '.';

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

  .items((e) => {
    e.title('DragTarget');
    e.markdown('Drag and drop a file over the target.');
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: 'useDragTarget',
        position: [150, 80],
      },
      host: { background: -0.04 },
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
    toolbar: css({ marginBottom: 20 }),
    dragOver: css({ Absolute: 0, Flex: 'center-center', pointerEvents: 'none' }),
  };

  const elDragOver = dragTarget.isDragOver && (
    <div {...styles.dragOver}>
      <div>Drop File</div>
    </div>
  );

  const { isDragOver, dropped } = dragTarget;
  const data = { isDragOver, dropped };

  return (
    <div ref={ref} {...styles.base}>
      <div {...styles.toolbar}>
        <Button onClick={() => dragTarget.reset()}>Reset</Button>
      </div>
      <ObjectView name={'debug'} data={data} expandLevel={10} />
      {elDragOver}
    </div>
  );
};

export default actions;
