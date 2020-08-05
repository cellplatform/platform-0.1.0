import * as React from 'react';
import { Subject } from 'rxjs';
import { color, css, CssValue, ui } from '../../common';
import { Button } from '../primitives';
import * as t from './types';
import { TestPanelSelected } from './TestPanelSelected';

export type ITestPanelProps = {
  root: t.MyModule;
  selected?: t.MyModule;
  style?: CssValue;
};

export class TestPanel extends React.PureComponent<ITestPanelProps> {
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const actions = this.root.action(this.unmounted$);

    actions.dispatch$.subscribe((e) => {
      console.log('dispatched', e);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Props]
   */
  public get root() {
    return this.props.root;
  }

  /**
   * [Render]
   */
  public render() {
    const selected = this.props.selected;

    const styles = {
      base: css({
        flex: 1,
        padding: 30,
      }),
      title: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        marginBottom: 8,
        paddingBottom: 8,
      }),
      buttons: css({
        Flex: 'horizontal-start-start',
        lineHeight: '1.6em',
      }),
      space: css({ MarginX: 15 }),
    };

    const space = <div {...styles.space} />;

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>
          <strong>IModule:</strong>
          {this.root.id}
        </div>
        <div {...styles.buttons}>
          <Button onClick={this.onRegisterClick}>Register</Button>
          {space}
          <Button onClick={this.onClearClick}>Clear</Button>
        </div>
        {selected && <TestPanelSelected module={selected} />}
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onRegisterClick = () => {
    this.props.root.dispatch({
      type: 'Module/register',
      payload: { id: 'foo', name: 'My Module' },
    });
  };

  private onClearClick = () => {
    this.root.clear();
  };
}
