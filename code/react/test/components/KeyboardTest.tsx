import * as React from 'react';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KeyBindings, Keyboard, IKeypressEvent } from '../../src';
import { ObjectView, log, css } from './common';
// import { describe, log, ObjectView, React, time } from '../../test/storybook';

type MyCommands = 'SAVE' | 'PASTE' | 'FOO' | 'BAR';
const bindings: KeyBindings<MyCommands> = [
  { command: 'SAVE', key: 'CMD+S' },
  { command: 'PASTE', key: 'CMD+V' },
  { command: 'FOO', key: 'CMD+SHIFT+V' },
  { command: 'BAR', key: 'CMD+SHIFT+V+B' },
];
const keyboard = Keyboard.create({ bindings });

// describe('behavior/keyboard', {
//   title: 'Keyboard command manager.',
//   padding: 50,
//   cropMarks: false,
//   align: 'top left',
// })
//   .add('default', () => <Test key={'default'} keyboard={keyboard} />)
//   .add('disposed (takeUntil)', () => {
//     const stop$ = new Subject();
//     time.delay(2000, () => {
//       stop$.next();
//       log.info('Stopped!');
//     });
//     return <Test key={'stopped'} keyboard={keyboard.takeUntil(stop$)} />;
//   });

export interface IKeyboardTestProps {
  keyboard?: Keyboard<MyCommands>;
}
export interface IKeyboardTestState {
  keyPress?: IKeypressEvent;
}

export class KeyboardTest extends React.PureComponent<IKeyboardTestProps, IKeyboardTestState> {
  public state: IKeyboardTestState = {};
  private unmounted$ = new Subject();
  private keyboard = this.props.keyboard || keyboard;

  public componentDidMount() {
    this.keyboard.keyPress$
      // Monitor all key-presses.
      .pipe(takeUntil(this.unmounted$))
      .subscribe(keyPress => this.setState({ keyPress }));

    this.keyboard.bindingPress$
      // Monitor key-bindings.
      .pipe(takeUntil(this.unmounted$))
      .subscribe(e => {
        e.preventDefault();
        log.info('!! Binding: ', e);
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  public render() {
    const { keyPress } = this.state;
    const styles = {
      base: css({ padding: 20 }),
    };
    const data = {
      key: keyPress && keyPress.code,
      latest: this.formatKey(this.keyboard.latest),
      bindings: this.keyboard.bindings,
    };
    return (
      <div {...styles.base}>
        <ObjectView
          data={data}
          name={'keyboard'}
          expandLevel={1}
          expandPaths={['$.bindings', '$.bindings.*']}
        />
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
