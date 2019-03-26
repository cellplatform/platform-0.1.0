import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../common';
import { Text } from '../primitives';

import { THEMES } from './themes';

export type ICellEditorViewProps = {
  title?: React.ReactNode;
  width?: number;
  height?: number;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

const BORDER_WIDTH = 2;

export class CellEditorView extends React.PureComponent<ICellEditorViewProps> {
  public static THEMES = THEMES;
  public static BORDER_WIDTH = BORDER_WIDTH;

  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  // public componentWillMount() {}

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

  /**
   * [Methods]
   */
  public focus() {
    console.log('FOCUS');
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
        border: `solid ${BORDER_WIDTH}px ${theme.borderColor}`,
        backgroundColor: theme.inputBackground,
        width,
        height,
        boxShadow: `0 0px ${theme.inputShadow.blur}px 0 ${color.format(theme.inputShadow.color)}`,
        fontSize: 14,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderTitle()}
        <Text>Cell</Text>
      </div>
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
        Absolute: [-4, null, null, 0 - BORDER_WIDTH],
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
}
