import * as React from 'react';
import { css, CssValue, ObjectView } from '..';

export type ITestProps = { style?: CssValue };

export class Test extends React.PureComponent<ITestProps> {
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: 30,
      }),
    };

    const data = {
      module: '@platform/ui.dev',
      msg: 'hello',
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <ObjectView data={data} />
      </div>
    );
  }
}
