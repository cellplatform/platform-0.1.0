import * as React from 'react';
import { Subject } from 'rxjs';
import { color, css, CssValue, ui } from '../../common';
import { Button } from '../primitives';
import * as t from './types';

export type ITestPanelProps = {
  factory: t.ModuleRender;
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

  public componentDidMount() {}

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
    const styles = {
      base: css({
        flex: 1,
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
        {this.renderSelected()}
      </div>
    );
  }

  private renderSelected() {
    const module = this.props.selected;
    if (!module) {
      return null;
    }

    const props = module.root.props;
    const data = props?.data || {};
    const view = props?.view || '';

    return this.props.factory({ module, data, view }) || null;
  }

  /**
   * [Handlers]
   */

  private onRegisterClick = () => {
    this.props.root.dispatch({
      type: 'MODULE/register',
      payload: { id: 'ns:foo', name: 'Foo' },
    });
  };

  private onClearClick = () => {
    this.root.clear();
  };
}
