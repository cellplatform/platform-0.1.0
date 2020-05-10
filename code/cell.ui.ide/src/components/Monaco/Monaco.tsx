import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '../../common';

import Editor from '@monaco-editor/react';

export type IMonacoProps = { style?: CssValue };
export type IMonacoState = {};

export class Monaco extends React.PureComponent<IMonacoProps, IMonacoState> {
  public state: IMonacoState = {};
  private state$ = new Subject<Partial<IMonacoState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IMonacoProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
      }),
    };

    const code = `
class Chuck {
  greet() {
      return Facts.next();
  }
}    

const foo: number[] = [1,2,3]

`;

    return (
      <div {...css(styles.base, this.props.style)}>
        <Editor language={'typescript'} theme={'Ink'} value={code} />
      </div>
    );
  }
}
