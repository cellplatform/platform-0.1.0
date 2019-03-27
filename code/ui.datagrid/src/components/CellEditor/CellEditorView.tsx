import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  takeUntil,
  take,
  takeWhile,
  map,
  filter,
  share,
  delay,
  distinctUntilChanged,
  debounceTime,
} from 'rxjs/operators';
import * as React from 'react';

import { color, constants, css, GlamorValue, t } from '../../common';
import { FormulaInput, Text } from '../primitives';
import { THEMES } from './themes';

const BORDER_WIDTH = 2;
const { DEFAULTS, COLORS } = constants;

export type ICellEditorViewProps = {
  value?: string;
  row?: number;
  column?: number;
  title?: React.ReactNode;
  mode?: 'FORMULA' | 'TEXT';
  width?: number;
  height?: number;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export type I__TEMP__State = { value?: string };
console.log(`\nTODO 🐷   Remove TEMP state from <CellEditorView> \n`);

export class CellEditorView extends React.PureComponent<ICellEditorViewProps, I__TEMP__State> {
  public state: I__TEMP__State = {};

  public static THEMES = THEMES;
  public static BORDER_WIDTH = BORDER_WIDTH;

  private unmounted$ = new Subject();

  private formula$ = new Subject<t.FormulaInputEvent>();
  private formula!: FormulaInput;
  private formulaRef = (ref: FormulaInput) => (this.formula = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    const formula$ = this.formula$.pipe(takeUntil(this.unmounted$));

    formula$.subscribe(e => {
      // console.log('e', e);
    });

    formula$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changed'),
        map(e => e.payload as t.IFormulaInputChanged),
      )
      .subscribe(e => {
        console.log('e', e);
        this.setState({ value: e.to });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get value() {
    return this.state.value || '';
  }

  private get theme() {
    const { theme = 'DEFAULT' } = this.props;
    if (typeof theme === 'object') {
      return theme;
    }
    switch (theme) {
      case 'DEFAULT':
        return THEMES.DEFAULT;
    }
    throw new Error(`Theme '${theme}' not supported`);
  }

  private get mode() {
    return this.props.mode || 'FORMULA';
  }

  private get row() {
    return this.props.row || 0;
  }
  private get column() {
    return this.props.column || 0;
  }

  /**
   * [Methods]
   */
  public focus() {
    switch (this.mode) {
      case 'TEXT':
        return;
      case 'FORMULA':
        if (this.formula) {
          this.formula.focus();
        }
        break;
    }
  }

  /**
   * [Render]
   */
  public render() {
    const { width, height } = this.props;
    const theme = this.theme;

    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: `0 0px ${theme.inputShadow.blur}px 0 ${color.format(theme.inputShadow.color)}`,
        backgroundColor: theme.inputBackground,
        width,
        height,
        minHeight: DEFAULTS.ROW_HEIGHTS + (this.row === 0 ? -1 : 0),
      }),
      body: css({
        Absolute: 0,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderBorder()}
        <div {...styles.body}>
          {this.renderTitle()}
          {this.renderBody()}
        </div>
      </div>
    );
  }

  private renderBorder() {
    return (
      <React.Fragment>
        <div {...STYLES.BORDER.left} />
        <div {...STYLES.BORDER.top} />
        <div {...STYLES.BORDER.right} />
        <div {...STYLES.BORDER.bottom} />
      </React.Fragment>
    );
  }

  private renderTitle() {
    const { title } = this.props;
    if (!title) {
      return null;
    }
    const theme = this.theme;
    const styles = {
      base: css({
        Absolute: [-3, null, null, 0],
        userSelect: 'none',
      }),
      body: css({
        Absolute: [null, null, 0, 0],
        backgroundColor: theme.titleBackground,
        color: theme.titleColor,
        fontSize: 12,
        PaddingX: 10,
        paddingTop: 5,
        paddingBottom: 3,
      }),
    };
    return (
      <div {...styles.base}>
        <Text style={styles.body}>{title}</Text>
      </div>
    );
  }

  private renderBody() {
    switch (this.mode) {
      case 'TEXT':
        return this.renderText();
      case 'FORMULA':
        return this.renderFormula();
    }
  }

  private renderText() {
    return <div>text</div>;
  }

  private renderFormula() {
    const styles = {
      base: css({
        position: 'relative',
        top: 1, // NB: Offset to vertically align an min-height.
        height: DEFAULTS.ROW_HEIGHTS - BORDER_WIDTH * 2,
        // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <FormulaInput
        ref={this.formulaRef}
        events$={this.formula$}
        multiline={false}
        value={this.value}
        fontSize={12}
        style={styles.base}
      />
    );
  }
}

/**
 * [Helpers]
 */
const STYLES = {
  BORDER: {
    left: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, null, 0, 0],
      width: BORDER_WIDTH,
    }),
    top: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, 0, null, 0],
      height: BORDER_WIDTH,
    }),
    right: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, 0, 0, null],
      width: BORDER_WIDTH,
    }),
    bottom: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [null, 0, 0, 0],
      height: BORDER_WIDTH,
    }),
  },
};
