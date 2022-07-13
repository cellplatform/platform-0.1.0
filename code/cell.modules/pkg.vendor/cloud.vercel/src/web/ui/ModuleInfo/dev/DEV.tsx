import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { ModuleInfo, ModuleInfoProps } from '..';
import * as k from '../types';
import { SAMPLE } from './DEV.data';
import { t, PropList } from '../common';

type Ctx = { props: ModuleInfoProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.ModuleInfo')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        data: {
          token: 'abcdefg123456==',
          deploy: SAMPLE.deploy,
        },
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('ModuleInfo');

    e.component((e) => {
      type F = t.ModuleInfoFields;
      return (
        <PropList.FieldSelector
          title={'ModuleInfo'}
          all={ModuleInfo.FIELDS}
          selected={e.ctx.props.fields}
          onClick={({ next }) => e.change.ctx((ctx) => (ctx.props.fields = next as F[]))}
          style={{ Margin: [25, 20, 25, 20] }}
        />
      );
    });

    // e.select((config) =>
    //   config
    //     .title('fields:')
    //     .items(ModuleInfoConstants.FIELDS)
    //     .initial(undefined)
    //     .clearable(true)
    //     .view('buttons')
    //     .multi(true)
    //     .pipe((e) => {
    //       if (e.changing) {
    //         const next = e.changing.next.map(({ value }) => value) as k.ModuleInfoFields[];
    //         e.ctx.props.fields = next.length === 0 ? undefined : next;
    //       }
    //     }),
    // );

    e.hr();

    e.component((e) => {
      return <ModuleInfo {...e.ctx.props} style={{ PaddingX: 20 }} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<ModuleInfo {...e.ctx.props} />);
  });

export default actions;
