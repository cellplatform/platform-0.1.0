import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocInsetPanelBlock, DocInsetPanelBlockProps } from '..';

type Ctx = { props: DocInsetPanelBlockProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Block.InsetPanel')
  .context((e) => {
    if (e.prev) return e.prev;

    const REF = {
      SB: `[@example](https://domain.com)`,
      RO_ETH: `[yeoro.eth](https://domain.com/yeoro.eth)`,
    };

    const markdown = `
*This article was originally published on ${REF.RO_ETH} → ${REF.SB}.*    
    `;

    const ctx: Ctx = { props: { markdown } };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      const markdown = e.ctx.props.markdown;
      const data = {
        ...e.ctx.props,
        markdown: markdown?.length || 0 > 25 ? `${markdown?.substring(0, 25)}...` : markdown,
      };
      return (
        <ObjectView
          name={'props'}
          data={data}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    e.settings({
      actions: { width: 350 },
      host: { background: -0.04 },
      layout: {
        width: 720,
        cropmarks: -0.2,
      },
    });
    e.render(<DocInsetPanelBlock {...e.ctx.props} style={{ flex: 1 }} />);
  });

export default actions;
