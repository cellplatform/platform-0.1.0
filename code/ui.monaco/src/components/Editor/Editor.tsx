import '../../config';

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, share } from 'rxjs/operators';
import { Monaco } from './components/Monaco';

import {
  css,
  events,
  GlamorValue,
  IEditorSettings,
  value,
  ISize,
} from '../../common';
import * as themes from '../../themes';

const BG = {
  DARK: themes.dark.colors['editor.background'],
};

export type IEditorProps = {
  settings?: Partial<IEditorSettings>;
  focusOnLoad?: boolean;
  style?: GlamorValue;
};

export interface IEditorState {
  size?: ISize;
}

/**
 * Code editor.
 */
export class Editor extends React.PureComponent<IEditorProps, IEditorState> {
  public state: IEditorState = {};

  /**
   * Fields.
   */
  private unmounted$ = new Subject();
  private _size$ = new Subject<ISize>();
  private size$ = this._size$.pipe(
    share(),
    takeUntil(this.unmounted$),
  );

  private el: HTMLDivElement | undefined;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  /**
   * Component view mounted.
   */
  public componentDidMount() {
    const resize$ = events.resize$.pipe(takeUntil(this.unmounted$));

    // Keep the editor size in sync with the component.
    resize$.subscribe(() => this.updateSize());
    this.updateSize();
  }

  /**
   * Disposed.
   */
  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * Render the editor.
   */
  public render() {
    const { size } = this.state;
    const settings = this.settings;
    const { theme } = settings;

    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundColor: theme === 'DARK' ? BG.DARK : undefined,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }),
      editor: css({
        Absolute: 0,
      }),
    };

    const elEditor = size && (
      <Monaco style={styles.editor} settings={settings} size$={this.size$} />
    );

    return (
      <div ref={this.elRef} {...css(styles.base, this.props.style)}>
        {elEditor}
      </div>
    );
  }

  /**
   * The editor settings, with all defaults.
   */
  public get settings(): IEditorSettings {
    const { settings: s = {} } = this.props;
    const def = value.defaultValue;
    return {
      selectOnLineNumbers: def(s.selectOnLineNumbers, true),
      fontSize: def(s.fontSize, 14),
      fontFamily: def(s.fontFamily),
      readOnly: def(s.readOnly, false),
      tabSize: def(s.tabSize, 2),
      language: def(s.language, 'typescript'),
      theme: def(s.theme, 'DARK'),
      javascriptDefaults: def(s.javascriptDefaults, { types: [] }),
      typescriptDefaults: def(s.typescriptDefaults, { types: [] }),
    };
  }

  /**
   * Updates the current size of the component.
   */
  public updateSize() {
    const el = this.el;
    if (el) {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      const size = { width, height };
      this.setState({ size });
      this._size$.next(size);
    }
  }

  /**
   * Places focus on the editor.
   */
  public focus() {
    console.log(`\nTODO 🐷   \n`);
    // if (this.editor) {
    //   this.editor.focus();
    // }
  }
}
