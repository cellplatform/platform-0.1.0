import * as React from 'react';
import { css, CssValue } from '@platform/css';

import { Hr, ImageSprite } from './common';
import { IconGrid } from './IconGrid';
import { Icons } from './Icons';

const SAMPLE_1X = require('../images/ImageSprite.test/sample.png'); // eslint-disable-line
const SAMPLE_2X = require('../images/ImageSprite.test/sample@2x.png'); // eslint-disable-line

const MAGENTA = '#F93B76';

export type ITestProps = { style?: CssValue };

export class Test extends React.PureComponent<ITestProps> {
  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        padding: 30,
      }),
      top: css({
        Flex: 'horizontal-spaceBetween-center',
      }),
      sprites: css({}),
    };

    const icons = Object.keys(Icons).map((name) => ({ name, icon: Icons[name] }));

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.top}>
          <Icons.Face size={64} color={MAGENTA} />
          <div {...styles.sprites}>
            {this.sprite(1, 1)}
            {this.sprite(2, 2)}
            {this.sprite(3, 2)}
          </div>
        </div>
        <Hr />
        <IconGrid icons={icons} />
        <Hr />
      </div>
    );
  }

  private sprite(x: number, y: number) {
    return (
      <ImageSprite
        x={x}
        y={y}
        width={20}
        height={15}
        image1x={SAMPLE_1X}
        image2x={SAMPLE_2X}
        total={{ x: 5, y: 4 }}
      />
    );
  }
}
