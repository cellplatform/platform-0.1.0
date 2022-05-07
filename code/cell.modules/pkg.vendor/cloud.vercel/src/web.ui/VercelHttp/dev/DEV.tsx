import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { VercelHttp, VercelHttpProps } from '..';
import { TestUtil } from '../../../web.test';
import { css, cuid, t, value } from '../../common';
import { DevFilesystem } from '../../dev';
import { ModuleInfo } from '../../ModuleInfo';

import { VercelHttp as Api } from '../../../web.Vercel';

type Ctx = {
  bus: t.EventBus;
  props: VercelHttpProps;
  http: t.Http;
  fs: t.Fs;
  output?: any;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.VercelHttp')
  .context((e) => {
    if (e.prev) return e.prev;

    const { bus, http } = TestUtil;
    const fs = TestUtil.fs.events;
    TestUtil.fs.init();

    const ctx: Ctx = {
      bus,
      http,
      fs,
      props: {},
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Debug');

    e.button('tmp', (e) => {
      // console.log('Crypto', Crypto);
      console.log('Api', Api);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Filesystem');

    const toPath = (count: number) => `foo/my-file-${count + 1}.json`;

    e.button('add', async (e) => {
      const msg = cuid().repeat(value.random(1, 50));
      const fs = e.ctx.fs;
      const total = (await fs.manifest()).files.length;
      const path = toPath(total);
      const data = { msg, total };
      fs.json.write(path, data);
    });

    e.hr(1, 0.1);

    e.button('delete: first', async (e) => {
      const fs = e.ctx.fs;
      const first = (await fs.manifest()).files[0];
      if (first) await fs.delete(first.path);
    });

    e.button('delete: last', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      const last = files[files.length - 1];
      if (last) await fs.delete(last.path);
    });

    e.button('delete: all (reset)', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

    e.hr();

    e.component((e) => {
      const styles = {
        base: css({
          Flex: 'y-stretch-stretch',
          Margin: [20, 45, 30, 45],
        }),
      };
      return (
        <div {...styles.base}>
          <ModuleInfo style={{ marginBottom: 15 }} fields={['Module', 'Token.API']} />
          <DevFilesystem fs={TestUtil.fs.instance} />
        </div>
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Vercel API');

    e.button('GET: /www/user', async (e) => {
      const http = e.ctx.http;

      const url = 'https://api.vercel.com/www/user';
      const res = await http.get(url);

      console.log('-------------------------------------------');
      console.log('res', res);
      console.log('res.json', res.json);

      e.ctx.output = res.json;
    });

    e.button('VercelHttp (wrapper)', (e) => {
      //
      const { http, fs } = e.ctx;

      /**
       * TODO 🐷
       */
      // const api = VercelHttpApi({ fs, http, token });
      // console.log('api', api);
      console.log('TODO', e.ctx);
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
