import { Hr } from 'sys.ui.dev';
import React from 'react';

import { COLORS, css, defaultValue } from '../../common';
import { SampleSwitches } from './DEV.sample.Switches';

export type SamplesProps = { isEnabled?: boolean; isChecked?: boolean };

export const Samples: React.FC<SamplesProps> = (props) => {
  const isEnabled = defaultValue(props.isEnabled, true);
  const isChecked = defaultValue(props.isChecked, true);

  const styles = {
    base: css({
      padding: 30,
      Scroll: true,
    }),
    centerY: css({
      Flex: 'horizontal-start-start',
    }),
    darkBg: css({
      backgroundColor: COLORS.DARK,
      PaddingY: 30,
      PaddingX: 20,
      marginTop: 50,
    }),
  };

  return (
    <div {...styles.base}>
      <div {...styles.centerY}>
        <SampleSwitches theme={'LIGHT'} isEnabled={isEnabled} isChecked={isChecked} />
      </div>

      <div {...css(styles.centerY, styles.darkBg)}>
        <SampleSwitches theme={'DARK'} isEnabled={isEnabled} isChecked={isChecked} />
      </div>
    </div>
  );
};

export const PinkDashed = () => <Hr.PinkDashed margin={[40, 0]} />;
