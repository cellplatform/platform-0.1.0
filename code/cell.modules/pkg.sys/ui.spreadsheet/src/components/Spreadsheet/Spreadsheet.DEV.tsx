import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { Spreadsheet, SpreadsheetProps } from '.';

type Ctx = { props: SpreadsheetProps };
const INITIAL = { props: {} };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/Spreadsheet')
  .context((prev) => prev || INITIAL)

  .items((e) => {
    e.title('props');
    // e.button('count: increment', (e) => e.ctx.count++);
    // e.button('count: decrement', (e) => e.ctx.count--);
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: '<Spreadsheet>',
        position: [150, 80],
      },
      host: { background: -0.04 },
    });
    e.render(<Spreadsheet {...e.ctx.props} />);
  });

export default actions;
