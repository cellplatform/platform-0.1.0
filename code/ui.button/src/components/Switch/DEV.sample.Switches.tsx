import { log } from 'sys.ui.dev';
import React from 'react';

import { Switch, SwitchTheme, SwitchProps } from '.';
import { COLORS, css, CssValue, t } from '../../common';

const ORANGE = '#F6A623';

export type SampleSwitchesProps = {
  isEnabled?: boolean;
  isChecked?: boolean;
  theme?: t.SwitchThemeName;
  style?: CssValue;
};

export const SampleSwitches: React.FC<SampleSwitchesProps> = (props) => {
  const { theme, isEnabled, isChecked } = props;
  const styles = {
    base: css({ Flex: 'horizontal-center-center' }),
    switch: css({ marginRight: 20 }),
  };

  const render = (props: SwitchProps) => {
    return (
      <Switch
        theme={theme}
        style={styles.switch}
        isEnabled={isEnabled}
        value={isChecked}
        {...props}
        onClick={(e) => {
          log.info('onClick', e);
        }}
      />
    );
  };

  const blueTheme = theme === 'DARK' ? SwitchTheme.DARK.BLUE : SwitchTheme.LIGHT.BLUE;

  return (
    <div {...styles.base}>
      {render({ id: 'my-switch' })}
      {render({ theme: blueTheme })}
      {render({ track: { borderWidth: { off: 2 } } })}
      {render({
        track: { borderWidth: { on: 2, off: 2 } },
        thumb: { color: { on: ORANGE, off: COLORS.WHITE, disabled: -0.1 } },
      })}
      {render({ track: { heightOffset: 6 }, thumb: { xOffset: 0, yOffset: 0 } })}
      {render({ height: 16 })}
      {render({ height: 16, theme: blueTheme })}
      {render({ height: 16, track: { borderWidth: { off: 2 } } })}
      {render({ height: 16, width: 35 })}
      {render({
        height: 16,
        width: 35,
        track: { heightOffset: 4 },
        thumb: { xOffset: 0, yOffset: 0 },
      })}
    </div>
  );
};
