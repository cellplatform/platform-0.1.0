import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t, css, color, CssValue, constants } from '../../common';

import Editor from '@monaco-editor/react';
import { configure } from '../Monaco.config';

export type IMonacoProps = { style?: CssValue };
export type IMonacoState = {};

let monaco!: t.IMonaco;
configure.init().then(e => (monaco = e.editor));

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
   * [Properties]
   */
  public get monaco() {
    return monaco;
  }

  /**
   * [Methods]
   */
  public addLib(filename: string, content: string) {
    return monaco.languages.typescript.typescriptDefaults.addExtraLib(content, filename);
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
foo.map(num => num + 1);

`;

    return (
      <div {...css(styles.base, this.props.style)}>
        <Editor language={'typescript'} theme={constants.THEME.NAME} value={code} />
      </div>
    );
  }
}
