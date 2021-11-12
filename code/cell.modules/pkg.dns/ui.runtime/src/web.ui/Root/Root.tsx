import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

import { WebRuntime } from 'sys.runtime.web';
import { Antechamber } from 'sys.ui.primitives/lib/ui/Antechamber';

export type RootProps = {
  bus: t.EventBus;
  target?: string;
  isOpen?: boolean;
  isSpinning?: boolean;
  style?: CssValue;
};

export const Root: React.FC<RootProps> = (props) => {
  const { bus, target = 'root', isOpen, isSpinning } = props;
  const remote = WebRuntime.ui.useModule({ bus, target });

  console.log('remote', remote);

  const styles = {
    base: css({
      Absolute: 0,
      // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
    antechamber: css({
      Absolute: 0,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Antechamber isSpinning={isSpinning} isOpen={isOpen} style={styles.antechamber} />
    </div>
  );
};
