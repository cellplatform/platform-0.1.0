import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { ModuleInfo, ModuleInfoProps } from '..';
import { COLORS, PropList, t } from '../common';

type Ctx = { props: ModuleInfoProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.ModuleInfo')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .items((e) => {
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

    e.hr();

    e.component((e) => {
      return <ModuleInfo {...e.ctx.props} style={{ PaddingX: 20 }} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: COLORS.BG },
      layout: { cropmarks: -0.2 },
    });
    e.render(<ModuleInfo {...e.ctx.props} />);
  });

export default actions;
