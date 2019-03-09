import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../../../common';

export type IEditorProps = {
  style?: GlamorValue;
};
export type IEditorState = {};

export class Editor extends React.PureComponent<IEditorProps, IEditorState> {
  public state: IEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IEditorState>>();

  /**
   * [Lifecycle]
   */

  constructor(props: IEditorProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Editor</div>
      </div>
    );
  }
}
