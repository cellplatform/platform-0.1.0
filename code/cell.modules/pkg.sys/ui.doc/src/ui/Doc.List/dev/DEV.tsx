import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocListProps } from '..';
import { COLORS, t } from '../common';
import { Doc } from '../../Doc';

type Ctx = {
  sizes?: t.DocLayoutSizes;
  props: DocListProps;
  debug: {
    render: boolean;
    onResize: t.DocResizeHandler;
  };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.List')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const ctx: Ctx = {
      props: {
        tracelines: true,
      },
      debug: {
        render: true,
        // showAsCards: true,
        onResize: (e) => change.ctx((ctx) => (ctx.sizes = e.sizes)),
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.button('redraw', (e) => e.redraw());

    e.hr();
  })

  .items((e) => {
    /**
     * TODO 🐷
     */
    e.title('[TODO] 🐷 P2');

    e.markdown(`
    
- Self: [sys.ui.doc/<Doc.List>]
- Cross Ref: same problem in [sys.fs:ui/<Filesystem.PathList>]
- Janky scrolling - underlying primitive works [sys.ui.primitives:<List.Virtual>]
- Delay fixing (P2) because:
   - works acceptably on Rowan's machine
   - Fix understandable (because it works in the unerlying library)

- Resize, cards position correctly
- Connector Lines
- Dynamic Item Sizing

    `);
    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      const label = (value: string) => `showAsCards: ${value}`;
      config
        .items([
          { label: label('<undefined>'), value: undefined },
          { label: label('true'), value: true },
          ...Doc.List.DEFAULT.showAsCards.all.map((value) => ({
            label: label(`"${value}"`),
            value,
          })),
        ])
        .initial(config.ctx.props.showAsCards)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.showAsCards = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.boolean('[TODO] list.connectorLines', (e) => {
      if (e.changing) e.ctx.props.connectorLines = e.changing.next;
      e.boolean.current = e.ctx.props.connectorLines;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('tracelines', (e) => {
      if (e.changing) e.ctx.props.tracelines = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.tracelines);
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { props, debug, sizes } = e.ctx;

    e.settings({
      host: { background: COLORS.BG },
      layout: {
        label: {
          topLeft: '<Doc.List>',
          topRight: sizes ? `${sizes.root.width} x ${sizes.root.height} px` : undefined,
          bottomRight: sizes ? `center column: ${sizes.column.width}px` : undefined,
        },
        position: [80, 80, 130, 80],
        cropmarks: -0.2,
        border: -0.05,
      },
    });

    if (debug.render) {
      e.render(
        <Doc.Fonts style={{ flex: 1 }}>
          <Doc.LayoutContainer
            onResize={debug.onResize}
            tracelines={props.tracelines}
            style={{ flex: 1 }}
          >
            <Doc.List {...e.ctx.props} style={{ flex: 1 }} />
          </Doc.LayoutContainer>
        </Doc.Fonts>,
      );
    }
  });

export default actions;
