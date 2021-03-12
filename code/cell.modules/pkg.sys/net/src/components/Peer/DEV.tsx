import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { css, rx, t, PeerJS, cuid } from '../../common';

type O = Record<string, unknown>;

type Ctx = {
  bus: t.EventBus<t.PeerEvent>;
  address: string;
  data: O;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('sys.net/Peer')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus<t.PeerEvent>();

    return {
      bus,
      address: 'rtc.cellfs.com/peer',
      data: {},
    };
  })

  .items((e) => {
    //
    e.title('PeerJS');

    e.textbox((config) => {
      config
        .initial(config.ctx.address)
        .placeholder('address: host/path')
        .pipe((e) => {
          if (e.changing) {
            e.ctx.address = e.changing.next;
          }
          // console.log('host/path', e);
        });
    });

    e.button('peer: create', (e) => {
      const parseAddress = (address: string) => {
        const [host, path] = (address || '').trim().split('/');
        return { host, path };
      };

      // console.log("title", title)

      const res = parseAddress(e.ctx.address);

      const { host, path } = res;

      console.log('res', res);

      // const host = 'rtc.cellfs.com';
      // const path = 'peer';
      const secure = true;
      const port = secure ? 443 : 80;

      const args = { host, path, port, secure };

      const id = cuid();
      const peer = new PeerJS(id, { host, path, port, secure });

      // console.log('foo', e);
      e.ctx.data.Peer = { id, SignalServer: args };

      console.log('peer', peer);
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      layout: {
        label: 'Peer',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
      host: { background: -0.04 },
    });

    const styles = {
      base: css({ padding: 30 }),
    };

    const el = (
      <div {...styles.base}>
        <ObjectView data={e.ctx.data} expandLevel={5} />
      </div>
    );
    e.render(el);
  });

export default actions;
