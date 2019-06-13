import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import {
  time,
  color,
  css,
  datagrid,
  MeasureSize,
  t,
  value as valueUtil,
  COLORS,
} from '../../../common';

export type IDbGridEditorProps = {};
export type IDbGridEditorState = {
  value?: datagrid.CellValue;
  width?: number;
  textWidth?: number;
};

const BORDER = {
  WIDTH: 2,
};

export class DbGridEditor extends React.PureComponent<IDbGridEditorProps, IDbGridEditorState> {
  public state: IDbGridEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IDbGridEditorState>>();

  public static contextType = datagrid.EditorContext;
  public context!: datagrid.ReactEditorContext;

  private input!: HTMLInputElement;
  private inputRef = (ref: HTMLInputElement) => (this.input = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
    state$.subscribe(e => this.context.set({ value: this.value }));

    // Update <input> on keypress.
    const keys$ = this.context.keys$;
    keys$.pipe(filter(e => e.isEnter)).subscribe(e => this.context.complete());

    // Set initial values.
    const value = this.context.cell.value;
    this.state$.next({ value });
  }

  public componentDidMount() {
    this.input.focus();
    this.input.select();
    this.updateSize();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get value() {
    const value = valueUtil.defaultValue(this.state.value, '');
    return (value || '').toString();
  }

  /**
   * [Methods]
   */
  public updateSize() {
    let value = this.state.value;
    value = typeof value === 'object' ? JSON.stringify(value) : value;
    const content = <div {...STYLES.inputText}>{value}</div>;
    const textSize = MeasureSize.measure({ content, style: STYLES.input });
    const textWidth = textSize.width;

    const cell = this.context.cell;
    const rightCell = cell.sibling.right;
    const width = cell.width + (rightCell ? rightCell.width : 0) - BORDER.WIDTH * 2;

    this.state$.next({ textWidth, width });
  }

  /**
   * [Render]
   */
  public render() {
    const td = this.context.cell.td;

    const styles = {
      base: css({
        boxSizing: 'border-box',
        backgroundColor: COLORS.WHITE,
        border: `solid ${BORDER.WIDTH}px ${COLORS.BLUE}`,
        width: this.state.width,
        height: td.offsetHeight - BORDER.WIDTH * 2 + 1,
        Flex: 'vertical-stetch-stretch',
      }),
      input: css({
        outline: 'none',
        Absolute: 0,
        border: 'none',
        backgroundColor: 'transparent',
        PaddingX: 4,
      }),
    };

    return (
      <div {...styles.base}>
        <input
          {...css(STYLES.inputText, styles.input)}
          ref={this.inputRef}
          value={this.value}
          onChange={this.handleChange}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.state$.next({ value });
    time.delay(0, () => this.updateSize());
  };
}

/**
 * [Internal]
 */
const STYLES = {
  inputText: css({
    fontSize: 14,
  }),
  input: css({
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: 4,
  }),
};
