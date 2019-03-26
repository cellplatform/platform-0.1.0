import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../common';
import { Text } from '../primitives';

import { THEMES } from './themes';

export type ICellEditorViewProps = {
  width?: number;
  height?: number;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export class CellEditorView extends React.PureComponent<ICellEditorViewProps> {
  public static THEMES = THEMES;
  public static BORDER_WIDTH = 2;

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
   * [Render]
   */
  public render() {
    const { width, height } = this.props;
    const theme = this.theme;

    const styles = {
      base: css({
        boxSizing: 'border-box',
        border: `solid 2px ${theme.borderColor}`,
        // border: `solid ${CellEditorView.BORDER_WIDTH}px ${'red'}`,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        width,
        height,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Text>Cell</Text>
      </div>
    );
  }
}
