import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

import { WebRuntime } from 'sys.runtime.web';
import { Antechamber } from 'sys.ui.primitives/lib/ui/Antechamber';

import { MinSize } from 'sys.ui.primitives/lib/ui/MinSize';

import { PositioningLayers } from 'sys.ui.primitives/lib/ui/PositioningLayers';
import { DevSample } from 'sys.ui.primitives/lib/ui/PositioningLayers/dev/DEV.Sample';

export type RootProps = {
  bus: t.EventBus;
  target?: string;
  isOpen?: boolean;
  isSpinning?: boolean;
  style?: CssValue;
};

export const Root: React.FC<RootProps> = (props) => {
  const { bus, target = 'root', isOpen, isSpinning } = props;
  const remote = WebRuntime.ui.useModuleTarget({ bus, target });

  console.log('remote', remote);

  const styles = {
    base: css({
      Absolute: 0,
    }),
    layers: css({
      Absolute: 0,
    }),
    tooSmall: {
      base: css({ Absolute: 0, Flex: 'center-center' }),
      body: css({
        PaddingX: 25,
        PaddingY: 10,
        borderRadius: 5,
        border: `dashed 1px ${color.format(-0.1)}`,
      }),
    },
  };

  const layer: t.PositioningLayer = {
    id: 'foo',
    position: { x: 'center', y: 'center' },
    render(e) {
      const info = e.find.first(layer.id);
      const overlaps = e.find.overlap(e.index);
      return <DevSample id={info?.id ?? layer.id} info={info} overlaps={overlaps} find={e.find} />;
    },
  };

  const layers = [layer];

  const elWarning = (
    <div {...styles.tooSmall.base}>
      <div {...styles.tooSmall.body}>Screen Too Small</div>
    </div>
  );

  return (
    <MinSize
      style={css(styles.base, props.style)}
      minWidth={400}
      minHeight={400}
      warningElement={elWarning}
      hideStrategy={'css:display'}
    >
      {/* <Antechamber isSpinning={isSpinning} isOpen={isOpen} style={styles.antechamber} /> */}
      <PositioningLayers layers={layers} style={styles.layers} />
    </MinSize>
  );
};
