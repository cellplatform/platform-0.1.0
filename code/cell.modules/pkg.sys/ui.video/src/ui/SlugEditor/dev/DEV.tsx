import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { SlugEditor, SlugEditorProps } from '..';

type Ctx = { props: SlugEditorProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.SlugEditor')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<SlugEditor>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<SlugEditor {...e.ctx.props} />);
  });

export default actions;
