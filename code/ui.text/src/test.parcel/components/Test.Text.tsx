import { color, css, CssValue } from '@platform/css';
import { log } from '@platform/ui.dev';
import * as React from 'react';

import { ITextProps, Text } from '../..';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

const logEvent = (event: string) => (e: any) => log.info(event, e);

export type ITestTextProps = { style?: CssValue };

export class TestText extends React.PureComponent<ITestTextProps> {
  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Scroll: true,
        padding: 30,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderText('Default (logging events)', { onMouse: logEvent('onMouse') })}
        {this.renderText('fontWeight: LIGHT', { fontWeight: 'LIGHT' })}
        {this.renderText('fontWeight: NORMAL', { fontWeight: 'NORMAL' })}
        {this.renderText('fontWeight: BOLD', { fontWeight: 'BOLD' })}
        {this.renderText('uppercase', { uppercase: true })}
      </div>
    );
  }

  private renderText(title: string, props: ITextProps = {}) {
    const styles = {
      base: css({ marginBottom: 50 }),
      title: css({
        fontSize: 12,
        color: color.format(-0.5),
        marginBottom: 15,
      }),
      text: css({ MarginX: 30 }),
      color: css({ color: 'red' }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.title}>{title}</div>
        <Text {...props} style={css(styles.text, styles.color)}>
          {LOREM}
        </Text>
      </div>
    );
  }
}
