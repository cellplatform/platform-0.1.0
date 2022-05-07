import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { VercelHttp, VercelHttpProps } from '..';
import { Http, t } from '../../common';
import { VERCEL_TEST_TOKEN } from '../../../__SECRET__';

type Ctx = {
  props: VercelHttpProps;
  http: t.Http;
  output?: any;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.VercelHttp')
  .context((e) => {
    if (e.prev) return e.prev;

    const Authorization = `Bearer ${VERCEL_TEST_TOKEN}`;
    const headers = { Authorization };
    const http = Http.create({ headers });

    const ctx: Ctx = {
      http,
      props: {},
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Vercel HTTP/API');

    e.button('GET: /www/user', async (e) => {
      const http = e.ctx.http;

      const url = 'https://api.vercel.com/www/user';
      const res = await http.get(url);

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('res.json', res.json);

      e.ctx.output = res.json;
    });

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'output'}
          data={e.ctx.output}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
          expandLevel={5}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      actions: { width: 400 },
      layout: {
        label: '<VercelHttp>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<VercelHttp {...e.ctx.props} />);
  });

export default actions;
