import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocIdentity, DocIdentityProps } from '..';
import { SAMPLE } from '../../DEV.Sample.DATA';

type Ctx = { props: DocIdentityProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Identity')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        version: '1.2.3',
        author: {
          name: 'Display Name',
          avatar: SAMPLE.common.author.avatar,
        },
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
  })

  .items((e) => {
    e.title('Dev');

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
      actions: { width: 300 },
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<DocIdentity {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
