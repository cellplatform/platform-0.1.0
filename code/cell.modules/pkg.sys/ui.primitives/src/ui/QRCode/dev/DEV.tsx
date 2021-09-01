import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { QRCode, QRCodeProps } from '..';

type Ctx = { props: QRCodeProps };
const Default = { size: 128 };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.QRCode')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      props: {
        value: 'sha256-c095f673b440ebf0db01afb1c860cddc49f7654b2e356af5681f2b16b2be6025',
        size: Default.size,
        renderAs: 'canvas',
      },
    };
  })

  .items((e) => {
    e.title('Props');

    e.textbox((config) =>
      config
        .title('value')
        .initial(config.ctx.props.value)
        .pipe((e) => {
          if (e.changing?.action === 'invoke') e.textbox.current = e.changing.next || '';
          e.ctx.props.value = e.textbox.current || '';
        }),
    );

    e.textbox((config) =>
      config
        .title('size')
        .initial((config.ctx.props.size || Default.size).toString())
        .pipe((e) => {
          if (e.changing?.action === 'invoke')
            e.textbox.current = e.changing.next || Default.size.toString();

          e.ctx.props.size = parseInt(e.textbox.current || Default.size.toString(), 10);
        }),
    );

    e.select((config) => {
      config
        .title('renderAs')
        .initial(config.ctx.props.renderAs)
        .view('buttons')
        .items(['canvas', 'svg'])
        .pipe((e) => (e.ctx.props.renderAs = e.select.current[0].value));
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<QRCode>',
        // position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<QRCode {...e.ctx.props} />);
  });

export default actions;
