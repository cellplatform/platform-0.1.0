import * as React from 'react';
import { COLORS, css, CssValue } from '../common';

export type IIdentifiersProps = {
  module?: string;
  selected?: string;
  style?: CssValue;
};

export class Identifiers extends React.PureComponent<IIdentifiersProps> {
  public render() {
    const { selected, module } = this.props;

    const styles = {
      base: css({}),
      code: css({
        fontFamily: 'Menlo, monospace',
        color: COLORS.CLI.MAGENTA,
        fontSize: 10,
        margin: 0,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <pre {...styles.code}>
          <div>{`Module:   ${module || '<empty>'}`}</div>
          <div>{`Selected: ${selected || '<empty>'}`}</div>
        </pre>
      </div>
    );
  }
}
