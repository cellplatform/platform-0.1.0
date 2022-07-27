import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Semver, SemverProps } from '..';
import { css, semver } from '../common';

type Ctx = {
  props: SemverProps;
  debug: {
    releaseType: semver.ReleaseType;
    prerelease?: string;
    prefix: boolean;
    suffix: boolean;
  };
};

const Util = {
  props(ctx: Ctx) {
    const { props, debug } = ctx;

    const elPrefix = <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>{'my prefix'}</div>;

    return {
      ...props,
      prefix: debug.prefix ? elPrefix : undefined,
      suffix: debug.suffix ? 'my suffix' : undefined,
    };
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Semver')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        version: '1.2.3',
        fontSize: 36,
      },
      debug: {
        releaseType: 'patch',
        prerelease: 'alpha',
        prefix: false,
        suffix: false,
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('fontSize')
        .items([
          { label: 'small - 11px', value: 11 },
          { label: 'normal - 14px (default)', value: 14 },
          { label: 'large - 36px', value: 36 },
        ])
        .initial(config.ctx.props.fontSize)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.fontSize = e.changing?.next[0].value;
        });
    });

    e.hr(10, 0);
    /**
     * TODO 🐷
     * ui.dev
     *    ensure <0> value turns color to transparent.
     */

    e.boolean('[TODO] tracelines', (e) => {
      // if (e.changing) e.ctx.props = e.changing.next;
      // e.boolean.current = e.ctx.props;
    });

    e.hr(1, 0.1);

    e.boolean('prefix', (e) => {
      if (e.changing) e.ctx.debug.prefix = e.changing.next;
      e.boolean.current = e.ctx.debug.prefix;
    });

    e.boolean('suffix', (e) => {
      if (e.changing) e.ctx.debug.suffix = e.changing.next;
      e.boolean.current = e.ctx.debug.suffix;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.select((config) => {
      config
        .title('prerelease')
        .items([{ value: undefined, label: '<undefined>' }, 'alpha', 'beta', 'preview'])
        .initial(config.ctx.debug.prerelease)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.prerelease = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .title('releaseType')
        .items(Semver.constants.releaseTypes)
        .initial(config.ctx.debug.releaseType)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.releaseType = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.button('increment', (e) => {
      const { props, debug } = e.ctx;
      const current = props.version || Semver.default;
      const { releaseType } = debug;
      const identifier = releaseType.startsWith('pre') ? debug.prerelease : undefined;
      props.version = semver.inc(current, releaseType, identifier) || Semver.default;
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
    const props = Util.props(e.ctx);

    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<Semver {...props} />);

    e.render(
      () => {
        const styles = { a: css({ textDecoration: 'none' }) };
        const url = 'https://semver.org';
        return (
          <a {...styles.a} href={url} target={'_blank'} rel={'noreferrer'}>
            {url}
          </a>
        );
      },
      { position: [10, null, null, 10] },
    );
  });

export default actions;
