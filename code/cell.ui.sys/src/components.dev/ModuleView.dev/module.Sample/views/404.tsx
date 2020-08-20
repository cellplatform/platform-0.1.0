import * as React from 'react';

import { color, COLORS, css, CssValue } from '../../common';
import { Identifiers } from './Identifiers';

export type ITest404Props = {
  view: string;
  module?: string;
  selected?: string;
  style?: CssValue;
};

export class Test404 extends React.PureComponent<ITest404Props> {
  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'center-center',
        color: COLORS.DARK,
        position: 'relative',
      }),
      body: css({
        Flex: 'vertical-center-center',
        textAlign: 'center',
      }),
      view: css({
        margin: 0,
        marginTop: 6,
        paddingTop: 7,
        fontFamily: 'Menlo, monospace',
        color: COLORS.CLI.MAGENTA,
        fontSize: 12,
        borderTop: `solid 3px ${color.format(-0.06)}`,
        minWidth: 300,
      }),
      identifiers: css({
        Absolute: [null, null, 20, 20],
      }),
    };

    const view = this.props.view ? `"${this.props.view}"` : '<empty>';

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          <div>Not Found</div>
          <div {...styles.view}>view: {view}</div>
        </div>
        <Identifiers
          style={styles.identifiers}
          module={this.props.module}
          selected={this.props.selected}
        />
      </div>
    );
  }
}
