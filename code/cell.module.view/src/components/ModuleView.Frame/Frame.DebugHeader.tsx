import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t, COLORS } from '../../common';

export type IDebugHeaderProps = {
  rendered: t.IModuleRendered<any>;
  style?: CssValue;
};

export class DebugHeader extends React.PureComponent<IDebugHeaderProps> {
  /**
   * [Properties]
   */

  private get text() {
    const { el, view, target } = this.props.rendered;
    const parts: string[] = [];
    const typename = el?.type?.name;

    if (typename) {
      parts.push(`<${typename}> |`);
    }
    if (view) {
      parts.push(`view: "${view}"`);
    }
    if (target) {
      parts.push(`target: "${target}"`);
    }

    return parts.length === 0 ? '' : parts.join(' ');
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: [-14, 0, null, 0],
        fontSize: 9,
        textAlign: 'right',
        Flex: 'horizontal-end-spaceBetween',
        fontFamily: 'Menlo, monospace',
        color: COLORS.DARK,
        opacity: 0.6,
        userSelect: 'none',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div />
        <div>{this.text}</div>
      </div>
    );
  }
}
