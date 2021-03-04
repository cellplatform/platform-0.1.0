import React from 'react';

import { DevActions } from 'sys.ui.dev';
import { ZoomParent, ZoomParentProps } from '.';

type Ctx = { props: ZoomParentProps };
const INITIAL = { props: {} };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('components/ZoomParent')
  .context((prev) => prev || INITIAL)

  .items((e) => {
    e.title('props');
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
        label: '<ZoomParent>',
        position: [150, 80],
      },
      host: { background: -0.04 },
    });

    const Sample: React.FC = () => {
      return <ZoomParent {...e.ctx.props} />;
    };

    e.render(<Sample />);
  });

export default actions;
