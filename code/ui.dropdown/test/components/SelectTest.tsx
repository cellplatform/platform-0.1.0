import * as React from 'react';
import Select from 'react-select';
import { ActionMeta, ValueType } from 'react-select/lib/types';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue } from '../common';

type OptionType = any;

export type ISelectTestProps = { style?: CssValue };
export type ISelectTestState = {};

/**
 * - https://react-select.com
 */

export class SelectTest extends React.PureComponent<ISelectTestProps, ISelectTestState> {
  public state: ISelectTestState = {};
  private state$ = new Subject<Partial<ISelectTestState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  public get selected() {
    return undefined;
  }

  public get options() {
    return [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' },
    ];
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Select
          value={this.selected}
          options={this.options}
          isMulti={true}
          onChange={this.handleChange}
          isClearable={true}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleChange = (e: ValueType<OptionType>, action: ActionMeta) => {
    console.group('🌳 onChange');
    console.log('e', e);
    console.log('action', action);
    console.groupEnd();
  };
}
