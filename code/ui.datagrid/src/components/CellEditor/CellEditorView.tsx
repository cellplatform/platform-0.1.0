import * as React from 'react';
import { Subject } from 'rxjs';

import { color, constants, css, GlamorValue, t } from '../../common';
import { FormulaInput, Text } from '../primitives';
import { THEMES } from './themes';

const BORDER_WIDTH = 2;
const { DEFAULTS, COLORS } = constants;

export type ICellEditorViewProps = {
  row?: number;
  column?: number;
  title?: React.ReactNode;
  mode?: 'FORMULA' | 'TEXT';
  width?: number;
  height?: number;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export class CellEditorView extends React.PureComponent<ICellEditorViewProps> {
  public static THEMES = THEMES;
  public static BORDER_WIDTH = BORDER_WIDTH;

  private unmounted$ = new Subject();

  private formulaInput!: FormulaInput;
  private formulaInputRef = (ref: FormulaInput) => (this.formulaInput = ref);

  /**
   * [Lifecycle]
   */
  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
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
        if (this.formulaInput) {
          this.formulaInput.focus();
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
        ref={this.formulaInputRef}
        value={'=SUM(1,2,3)'}
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
