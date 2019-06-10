import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IKeyBindingEvent, IKeypressEvent, KeyBindings, Keyboard } from '../../src';
import { color, css, ObjectView } from './common';

type MyCommands = 'SAVE' | 'PASTE' | 'FOO' | 'BAR' | 'JAM';
const bindings: KeyBindings<MyCommands> = [
  { command: 'SAVE', key: 'CMD+S' },
  { command: 'PASTE', key: 'CMD+V' },
  { command: 'FOO', key: 'CMD+SHIFT+V' },
  { command: 'BAR', key: 'CMD+SHIFT+V+B' },
  { command: 'JAM', key: 'CMD+ALT+J' },
];
const keyboard = Keyboard.create({ bindings });

export interface IKeyboardTestProps {
  keyboard?: Keyboard<MyCommands>;
}
export interface IKeyboardTestState {
  keyPress?: IKeypressEvent;
  bindingPress?: IKeyBindingEvent<MyCommands>;
}

export class KeyboardTest extends React.PureComponent<IKeyboardTestProps, IKeyboardTestState> {
  public state: IKeyboardTestState = {};
  private state$ = new Subject<Partial<IKeyboardTestState>>();
  private unmounted$ = new Subject();
  private keyboard = this.props.keyboard || keyboard;

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    this.keyboard.keyPress$
      // Monitor all key-presses.
      .pipe(takeUntil(this.unmounted$))
      .subscribe(keyPress => this.state$.next({ keyPress }));

    this.keyboard.bindingPress$
      // Monitor key-bindings.
      .pipe(takeUntil(this.unmounted$))
      .subscribe(e => {
        e.preventDefault();
        this.state$.next({ bindingPress: e });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const { keyPress, bindingPress } = this.state;
    const styles = {
      base: css({ flex: 1 }),
      body: css({ padding: 20 }),
      binding: css({
        padding: 20,
        // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
    };
    const data = {
      key: keyPress && keyPress.code,
      latest: this.formatKey(this.keyboard.latest),
      bindings: this.keyboard.bindings,
    };

    const elBinding = bindingPress && (
      <span>
        {bindingPress.key} | {bindingPress.command}
      </span>
    );

    return (
      <div {...styles.base}>
        <div {...styles.binding}>Binding: {elBinding || 'none'}</div>
        <div {...styles.body}>
          <ObjectView
            data={data}
            name={'keyboard'}
            expandLevel={1}
            expandPaths={['$.bindings', '$.bindings.*']}
          />
        </div>
      </div>
    );
  }

  private formatKey = (e?: IKeypressEvent) => {
    if (e) {
      const { code, altKey, shiftKey, metaKey, ctrlKey } = e;
      return { code, altKey, shiftKey, metaKey, ctrlKey };
    }
    return;
  };
}
