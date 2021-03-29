import { Hr, log } from 'sys.ui.dev';
import React from 'react';

import { Button, ButtonProps, ButtonTheme } from '../Button';
import { COLORS, css, CssValue, defaultValue } from './common';
import { IconContent } from './DEV.sample.icons';

const PINK = '#CD638D';

const orange = ButtonTheme.BORDER.SOLID;
orange.backgroundColor.enabled = '#F6A623';
orange.color.enabled = -0.7;

export type SampleButtonsProps = {
  isEnabled?: boolean;
  style?: CssValue;
};

export const SampleButtons: React.FC<SampleButtonsProps> = (props) => {
  const isEnabled = defaultValue(props.isEnabled, true);

  const common: Partial<ButtonProps> = {
    isEnabled,
    margin: [null, 10, null, null],
    onClick(e) {
      log.info('Icon/onClick', e);
    },
  };

  const styles = {
    base: css({
      Absolute: 0,
      padding: 30,
      Scroll: true,
    }),
    iconContent: css({ Flex: 'horizontal-center-center' }),
    centerY: css({ Flex: 'horizontal-start-start' }),
    pinkBg: css({
      backgroundColor: PINK,
      PaddingY: 30,
      PaddingX: 20,
    }),
    darkBg: css({
      backgroundColor: COLORS.DARK,
      PaddingY: 30,
      PaddingX: 20,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Button id={'simple-label'} {...common} label={'Click Me'} />

      <PinkDashed />

      <div {...styles.centerY}>
        <Button {...common} margin={[0, 20, 0, 0]}>
          <IconContent label={'Foo'} />
        </Button>
        <Button {...common} margin={[0, 20, 0, 0]}>
          <IconContent label={'Bar'} />
        </Button>
        <Button {...common}>
          <IconContent color={COLORS.BLUE} />
        </Button>
      </div>

      <PinkDashed />

      <div {...styles.centerY}>
        <Button {...common} label={'Base Border'} theme={ButtonTheme.BORDER.BASE} />
        <Button
          {...common}
          label={'Down Theme'}
          theme={ButtonTheme.BORDER.BASE}
          downTheme={orange}
        />
        <Button
          {...common}
          label={'Blue Over'}
          theme={ButtonTheme.BORDER.BASE}
          overTheme={ButtonTheme.BORDER.BLUE}
        />
        <Button {...common} label={'Blue'} theme={ButtonTheme.BORDER.BLUE} />
        <Button {...common} theme={ButtonTheme.BORDER.BLUE}>
          <IconContent label={'Blue Icon'} color={isEnabled ? 1 : -0.3} />
        </Button>
      </div>
      <PinkDashed />
      <div {...styles.centerY}>
        <Button {...common} label={'Green'} theme={ButtonTheme.BORDER.GREEN} />
        <Button {...common} label={'Dark'} theme={ButtonTheme.BORDER.DARK} />
      </div>

      <PinkDashed />

      <div {...styles.centerY}>
        <Button
          {...common}
          label={'minWidth: 250'}
          theme={ButtonTheme.BORDER.BASE}
          minWidth={250}
        />
        <Button
          {...common}
          label={'minWidth: 250'}
          theme={ButtonTheme.BORDER.BLUE}
          minWidth={250}
        />
      </div>

      <PinkDashed />

      <div {...styles.pinkBg}>
        <Button {...common} label={'Dark'} theme={ButtonTheme.BORDER.DARK} />
        <Button {...common} label={'White'} theme={ButtonTheme.BORDER.WHITE} />
      </div>
    </div>
  );
};

export const PinkDashed = () => <Hr.PinkDashed margin={[40, 0]} />;
