import { id } from '@platform/util.value';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue } from '../../common';
import { Button } from '../primitives';
import * as t from './types';

export type ITestPanelSelectedProps = {
  module: t.MyModule;
  style?: CssValue;
};
export type ITestPanelSelectedState = t.Object;

export class TestPanelSelected extends React.PureComponent<
  ITestPanelSelectedProps,
  ITestPanelSelectedState
> {
  public state: ITestPanelSelectedState = {};
  private state$ = new Subject<Partial<ITestPanelSelectedState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Props]
   */
  public get module() {
    return this.props.module;
  }

  /**
   * [Render]
   */
  public render() {
    const module = this.module;
    const styles = {
      base: css({
        marginTop: 50,
        boxSizing: 'border-box',
        backgroundColor: color.format(-0.03),
        padding: 20,
        borderRadius: 5,
      }),
      title: css({
        marginBottom: 15,
      }),
      buttons: css({
        Flex: 'vertical-stretch-start',
        lineHeight: '1.8em',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>selected: {module.id || '-'}</div>
        <div {...styles.buttons}>
          <Button onClick={this.onChangeTreeClick}>manipulate tree</Button>
          <Button onClick={this.onDispatchClick}>dispatch</Button>
          <Button onClick={this.onRemoveClick}>remove</Button>
        </div>
      </div>
    );
  }
  /**
   * [Handlers]
   */

  private onChangeTreeClick = () => {
    const short = `yo-${id.shortid()}`;

    this.module.change((draft, ctx) => {
      ctx.children(draft, (children) => {
        children.push({
          id: short,
          props: {
            treeview: { label: short },
            data: { foo: 123 },
            view: 'TestPanelSelected',
            kind: 'MODULE',
          },
        });
      });
    });
  };

  private onDispatchClick = () => {
    this.module.dispatch({ type: 'FOO/event', payload: { count: 123 } });
  };

  private onRemoveClick = () => {
    const module = this.module;
    console.log('module', module);
    module.dispose();
  };
}
