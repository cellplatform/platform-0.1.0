import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Sample, SampleProps } from '..';
import { SampleProperties } from '../Sample.Properties';
import { time } from '../../../common';

import Pusher, { Channel } from 'pusher-js';

const APP_KEY = '54f40ae4fa522e73a6ef';
const APP_CLUSTER = 'ap4';
const type = 'my-event';

type Ctx = {
  pusher: Pusher;
  // channel: Channel;
  // subscription: Channel;
  props: SampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Sample')
  .context((e) => {
    if (e.prev) return e.prev;

    const pusher = new Pusher(APP_KEY, { cluster: APP_CLUSTER });
    // const channel = pusher.channel('my-channel');
    pusher.subscribe('my-channel');

    const ctx: Ctx = {
      get pusher() {
        return pusher;
      },
      // get channel() {
      //   return channel;
      // },
      // get subscription() {
      //   return subscription;
      // },

      props: { count: 0 },
    };

    return ctx;
  })

  .items((e) => {
    e.title('props');

    e.button('init', async (e) => {
      const pusher = e.ctx.pusher;

      await time.wait(50);

      const channel = pusher.channel('my-channel');

      await time.wait(50);

      console.log('pusher', pusher);
      console.log('channel', channel);
      // const subscription = pusher.subscribe('my-channel');

      // channel.bind(type, (e: any) => {
      //   console.log('channel', type, e);
      // });

      // subscription.bind(type, (e: any) => {
      //   console.log('subscription', type, e);
      // });
    });

    e.button('send', (e) => {
      console.log('e.ctx.pusher', e.ctx.pusher);
      // console.log('e.ctx.channel', e.ctx.channel);
      // e.ctx.channel.trigger(type, { foo: 123 });
      const channel = e.ctx.pusher.channel('my-channel');
      console.log('channel', channel);

      const pusher = e.ctx.pusher;

      pusher.send_event(type, { foo: 123 });

      // e.ctx.pusher.trigger(type, { foo: 123 });
    });

    e.hr(1, 0.1);

    e.component((e) => {
      return <SampleProperties props={e.ctx.props} style={{ MarginX: 20, MarginY: 10 }} />;
    });

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Sample>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<Sample {...e.ctx.props} />);
  });

export default actions;
