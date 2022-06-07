import React from 'react';
import { DevActions, ObjectView, TestUtil } from '../../../test';
import { Deploy, DeployProps } from '..';
import { t, ModuleInfo } from '../common';

type Ctx = {
  bus: t.EventBus;
  fs: t.Fs;
  props: DeployProps;
  debug: { render: boolean };
};

export const SAMPLE = {
  team: 'tdb',
  domain: 'tmp.db.team',
  project: 'tdb-tmp',
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Deploy')
  .context((e) => {
    if (e.prev) return e.prev;

    const filesystem = TestUtil.filesystem;
    filesystem.init();

    const ctx: Ctx = {
      bus: TestUtil.bus,
      fs: filesystem.events,
      props: {
        instance: filesystem.instance,
        token: TestUtil.token,
        team: SAMPLE.team,
        project: SAMPLE.project,
      },
      debug: { render: true },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.hr(1, 0.1);

    e.boolean('with team', (e) => {
      if (e.changing) e.ctx.props.team = e.changing.next ? SAMPLE.team : undefined;
      e.boolean.current = Boolean(e.ctx.props.team);
    });

    e.boolean('with project', (e) => {
      if (e.changing) e.ctx.props.project = e.changing.next ? SAMPLE.project : undefined;
      e.boolean.current = Boolean(e.ctx.props.project);
    });

    e.boolean('with domain', (e) => {
      if (e.changing) e.ctx.props.domain = e.changing.next ? SAMPLE.domain : undefined;
      e.boolean.current = Boolean(e.ctx.props.domain);
    });

    e.hr(1, 0.1);

    e.button('filesystem: delete all', async (e) => {
      const fs = e.ctx.fs;
      const files = (await fs.manifest()).files;
      await Promise.all(files.map((file) => fs.delete(file.path)));
    });

    e.hr();

    e.textbox((config) =>
      config.placeholder('set token').pipe((e) => {
        if (e.changing?.action === 'invoke') {
          const next = e.changing.next || '';
          TestUtil.Token.write(next);
          e.redraw();
        }
      }),
    );

    e.component((e) => {
      const token = TestUtil.token;
      const domain = e.ctx.props.domain;
      return (
        <ModuleInfo
          style={{ Margin: [30, 30, 30, 30] }}
          fields={['Module', 'Token.API.Hidden', 'Deploy.Domain']}
          data={{ token, deploy: { domain } }}
        />
      );
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
    const debug = e.ctx.debug;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Deploy>',
          topRight: `filesystem: "${TestUtil.filesystem.instance.fs}"`,
        },
        cropmarks: -0.2,
      },
    });

    e.render(debug.render && <Deploy {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
