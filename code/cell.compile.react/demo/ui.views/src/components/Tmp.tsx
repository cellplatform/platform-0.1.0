import { color, css, CssValue } from '@platform/react';
import { Spinner } from '@platform/ui.spinner';
import * as React from 'react';
import { Subject } from 'rxjs';

export type IFooProps = { style?: CssValue };
export type IFooState = {};

export class Foo extends React.PureComponent<IFooProps, IFooState> {
  public state: IFooState = {};

  /**
   * [Lifecycle]
   */
  constructor(props: IFooProps) {
    super(props);

    const f = new Subject();
    f.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.8)' /* RED */,
        color: color.format(0.5),
        fontSize: 45,
        padding: 20,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <h1>Tmp</h1>
        <div id={'STATUS'}>Loading</div>
        <Spinner size={32} color={1} />
      </div>
    );
  }
}
