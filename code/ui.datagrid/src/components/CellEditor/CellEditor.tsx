import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../common';
import { Text } from '../primitives';

import { ReactEditorContext, EditorContext } from '../../api';

import { THEMES } from './themes';

export type ICellEditorProps = {
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};
export type ICellEditorState = {};

export class CellEditor extends React.PureComponent<ICellEditorProps, ICellEditorState> {
  public static THEMES = THEMES;

  public static contextType = EditorContext;
  public context!: ReactEditorContext;

  public state: ICellEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICellEditorState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
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
    const theme = this.theme;
    const styles = {
      base: css({
        boxSizing: 'border-box',
        border: `solid 2px ${theme.borderColor}`,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <Text>Cell</Text>
      </div>
    );
  }
}
