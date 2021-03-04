import React, { useState } from 'react';

import { DevActions } from 'sys.ui.dev';
import { TransformParent, TransformParentProps, useDragTransform } from '.';
import { css, bundle } from '../../common';

type Ctx = {
  dragEnabled: boolean;
  props: TransformParentProps;
};
const INITIAL = { dragEnabled: true, props: {} };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/TransformParent')
  .context((prev) => prev || INITIAL)

  .items((e) => {
    e.title('ZoomParent');

    e.boolean('dragEnabled', (e) => {
      if (e.changing) e.ctx.dragEnabled = e.changing.next;
      e.boolean.current = e.ctx.dragEnabled;
    });

    e.hr();

    e.button('zoom: 1 (100%, undefined)', (e) => (e.ctx.props.zoom = undefined));
    e.button('zoom: 2', (e) => (e.ctx.props.zoom = 2));
    e.button('zoom: 0.2', (e) => (e.ctx.props.zoom = 0.2));

    e.hr(1, 0.1);

    e.button('offset: undefined', (e) => (e.ctx.props.offset = undefined));
    e.button('offset: { x: 5, y: 5 }', (e) => (e.ctx.props.offset = { x: 5, y: 5 }));
    e.button('offset: { x: 50, y: 150 }', (e) => (e.ctx.props.offset = { x: 50, y: 150 }));

    e.hr();
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
        label: '<TransformParent>',
        position: [150, 80],
      },
      host: { background: -0.04 },
    });

    e.render(<Sample ctx={e.ctx} />);
  });

export default actions;

const Sample: React.FC<{ ctx: Ctx }> = (props) => {
  const { ctx } = props;
  const styles = {
    base: css({
      Absolute: 0,
      display: 'flex',
    }),
    body: css({
      flex: 1,
    }),
    content: css({
      flex: 1,
      backgroundImage: `url(${bundle.path('static/images/hello.png')})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
    }),
  };

  const [localZoom, setLocalZoom] = useState<TransformParentProps['zoom']>(ctx.props.zoom);
  const [localOffset, setLocalOffset] = useState<TransformParentProps['offset']>(ctx.props.offset);

  const zoom = ctx.dragEnabled ? localZoom : ctx.props.zoom;
  const offset = ctx.dragEnabled ? localOffset : ctx.props.offset;

  const ref = React.useRef<HTMLDivElement>(null);
  useDragTransform({
    ref,
    zoom,
    offset,
    min: { zoom: 0.1, offset: { x: -200 } },
    max: { zoom: 5, offset: { y: 300 } },
    onZoom: (e) => setLocalZoom(e.next),
    onPan: (e) => setLocalOffset(e.next),
    canZoom: (e) => e.mouse.altKey,
    canPan: (e) => !e.mouse.altKey,
  });

  return (
    <div {...styles.base} ref={ref}>
      <TransformParent {...props} zoom={zoom} offset={offset} style={styles.body}>
        <div {...styles.content} />
      </TransformParent>
    </div>
  );
};
