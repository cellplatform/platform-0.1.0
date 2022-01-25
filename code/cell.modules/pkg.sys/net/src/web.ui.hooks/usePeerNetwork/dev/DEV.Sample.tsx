import React from 'react';
import { ObjectView } from 'sys.ui.dev';

import { usePeerNetwork } from '..';
import { css, CssValue, t } from '../common';

export type DevSampleProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { bus } = props;

  const net = usePeerNetwork({ bus });

  /**
   * [Render]
   */
  const styles = {
    base: css({
      padding: 15, // TEMP 🐷
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>
        <ObjectView data={net} />
      </div>
    </div>
  );
};
