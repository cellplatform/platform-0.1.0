import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { color, css, datagrid } from './common';

export type ITestEditorProps = {};
export type ITestEditorState = {};

export class TestEditor extends React.PureComponent<ITestEditorProps, ITestEditorState> {
  public state: ITestEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestEditorState>>();

  public static contextType = datagrid.EditorContext;
  public context!: datagrid.ReactEditorContext;

  private input!: HTMLInputElement;
  private inputRef = (ref: HTMLInputElement) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const keys$ = this.context.keys$;
    keys$
      .pipe(filter(e => e.isEnter))
      .subscribe(e => this.context.complete({ value: this.input.value }));

    // this.context.autoCancel = false;
    // keys$.pipe(filter(e => e.isEscape)).subscribe(e => this.context.cancel());
  }

  public componentDidMount() {
    this.input.focus();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        padding: 15,
        borderRadius: 4,
        border: `solid 1px ${color.format(-0.1)}`,
      }),
      input: css({
        outline: 'none',
      }),
    };
    return (
      <div {...styles.base}>
        <input {...styles.input} ref={this.inputRef} defaultValue={'foobar'} />
      </div>
    );
  }
}
