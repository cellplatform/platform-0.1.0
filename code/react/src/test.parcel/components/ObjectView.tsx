import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue } from '../../common';

const m = require('react-inspector'); // eslint-disable-line

const ReactInspector = m.default as React.ComponentClass<any>;

export type IObjectViewProps = {
  name?: string;
  data?: any;
  expandLevel?: number;
  expandPaths?: string[];
  style?: CssValue;
};
export type IObjectViewState = {};

export class ObjectView extends React.PureComponent<IObjectViewProps, IObjectViewState> {
  public state: IObjectViewState = {};
  private state$ = new Subject<Partial<IObjectViewState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IObjectViewProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
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
      base: css({}),
    };
    const data = this.props.data || {};
    const { expandLevel = 1, expandPaths = [] } = this.props;

    return (
      <div {...css(styles.base, this.props.style)}>
        <ReactInspector data={data} expandLevel={expandLevel} expandPaths={expandPaths} />
      </div>
    );
  }
}
