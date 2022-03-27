import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Semver, SemverProps } from '..';
import { css, semver } from '../common';

type Ctx = {
  props: SemverProps;
  debug: {
    releaseType: semver.ReleaseType;
    prerelease?: string;
  };
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
      debug: { releaseType: 'patch', prerelease: 'alpha' },
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
        .items(Semver.CONSTANTS.releaseTypes)
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
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<Semver {...e.ctx.props} />);

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
