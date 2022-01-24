import React, { useState } from 'react';

import { DevActions } from 'sys.ui.dev';
import { Zoom, ZoomProps, useZoomDrag } from '.';
import { css } from '../../common';

/**
 * Samples
 * https://jclem.net/posts/pan-zoom-canvas-react
 */

type Ctx = {
  dragEnabled: boolean;
  props: ZoomProps;
};
const INITIAL = { dragEnabled: true, props: {} };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.ZoomPan')
  .context((e) => e.prev || INITIAL)

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
        label: '<ZoomPan>',
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
    zoom: css({ flex: 1 }),
    content: css({
      flex: 1,
      backgroundImage: `url('static/images/sample/hello.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
    }),
  };

  const [localZoom, setLocalZoom] = useState<ZoomProps['zoom']>(ctx.props.zoom);
  const [localOffset, setLocalOffset] = useState<ZoomProps['offset']>(ctx.props.offset);

  const zoom = ctx.dragEnabled ? localZoom : ctx.props.zoom;
  const offset = ctx.dragEnabled ? localOffset : ctx.props.offset;

  const ref = React.useRef<HTMLDivElement>(null);
  useZoomDrag({
    ref,
    zoom,
    offset,
    min: { zoom: 0.3, offset: { x: -200 } },
    max: { zoom: 5, offset: { y: 300 } },
    canZoom: (e) => e.mouse.altKey,
    canPan: (e) => !e.mouse.altKey,
    onZoom: (e) => setLocalZoom(e.next),
    onPan: (e) => setLocalOffset(e.next),
  });

  const reset = () => {
    setLocalZoom(undefined);
    setLocalOffset(undefined);
  };

  return (
    <div {...styles.base} ref={ref} onDoubleClick={reset}>
      <Zoom {...props} zoom={zoom} offset={offset} style={styles.zoom}>
        <div {...styles.content} />
      </Zoom>
    </div>
  );
};
