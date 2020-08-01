import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, CssValue, color, Uri } from '../../common';

import * as t from './types';
import { TextInput, Button } from '../primitives';

export type ISheetInputUriProps = {
  store: t.IDebugSheetWrite;
  style?: CssValue;
};

export class SheetInputUri extends React.PureComponent<ISheetInputUriProps> {
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.store.event.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.props.store;
  }

  public get uri() {
    return this.store.state.uri;
  }

  public get sheet() {
    return this.store.state.sheet;
  }

  public get error() {
    return this.store.state.error.uri;
  }

  public get canLoad() {
    return Uri.clean(this.uri).length > 0;
  }

  /**
   * [Methods]
   */

  public load() {
    if (this.canLoad) {
      const text = Uri.clean(this.uri);
      this.store.change(
        (m) => {
          m.error.uri = !Uri.is.uri(text) ? 'Invalid namespace URI' : undefined;
          m.uri = formatUri(text);
        },
        { action: 'DEBUG/Sheet/load' },
      );
    }
  }

  public unload() {
    this.store.change((m) => {
      m.sheet = undefined;
    });
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        boxSizing: 'border-box',
        fontSize: 13,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderUriTextbox()}
        {this.renderError()}
      </div>
    );
  }

  private renderUriTextbox() {
    const styles = {
      base: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        Flex: 'horizontal-center-center',
      }),
      input: css({
        padding: 6,
        flex: 1,
      }),
    };
    return (
      <div {...styles.base}>
        <TextInput
          style={styles.input}
          value={this.uri}
          placeholder={'sheet uri'}
          placeholderStyle={{ color: color.format(-0.3), italic: true }}
          onChange={this.onTextInputChange}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize={false}
          autoComplete={false}
          autoSize={false}
          onEnter={this.onEnter}
        />
        {this.renderButton()}
      </div>
    );
  }

  private renderButton() {
    const styles = {
      base: css({ marginLeft: 8 }),
    };
    const sheet = this.store.state.sheet;
    return (
      <Button style={styles.base} onClick={this.onLoadClick} isEnabled={this.canLoad}>
        {sheet ? 'Unload' : 'Load'}
      </Button>
    );
  }

  private renderError() {
    if (!this.error) {
      return null;
    }
    const styles = {
      base: css({
        color: COLORS.CLI.MAGENTA,
        fontSize: 12,
        fontStyle: 'italic',
        paddingTop: 3,
      }),
    };
    return <div {...styles.base}>{this.error}</div>;
  }

  /**
   * [Handlers]
   */

  private onTextInputChange = (e: t.TextInputChangeEvent) => {
    this.store.change((m) => (m.uri = e.to));
  };

  private onEnter = () => {
    this.load();
  };

  private onLoadClick = () => {
    if (this.sheet) {
      this.unload();
    } else {
      this.load();
    }
  };
}

/**
 * [Helpers]
 */

function formatUri(input: string) {
  input = Uri.clean(input);
  try {
    const ns = Uri.toNs(input);
    return ns.toString();
  } catch (error) {
    return input;
  }
}
