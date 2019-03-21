import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, ObjectView, Hr } from './common';
import { events } from '../../src';

export type IEventsTestProps = { style?: GlamorValue };
export type IEventsTestState = { keyPress?: any; mouseDown?: any };

export class EventsTest extends React.PureComponent<IEventsTestProps, IEventsTestState> {
  public state: IEventsTestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IEventsTestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    const keyPress$ = events.keyPress$.pipe(takeUntil(this.unmounted$));
    const mouseDown$ = events.mouseDown$.pipe(takeUntil(this.unmounted$));

    keyPress$.subscribe(e => this.state$.next({ keyPress: e }));
    mouseDown$.subscribe(e =>
      this.state$.next({ mouseDown: { clientX: e.clientX, clientY: e.clientY } }),
    );
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        padding: 15,
      }),
      inputs: css({
        Flex: 'horizontal',
      }),
      input: css({
        marginRight: 12,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>
          <input type='text' placeholder={'input-1'} {...styles.input} />
          <input type='text' placeholder={'input-2'} {...styles.input} />
        </div>
        <Hr />
        <ObjectView name={'events'} data={this.state} expandLevel={1} />
      </div>
    );
  }
}

/**
 * Manage FOCUS state
 *
 * - https://stackoverflow.com/questions/10035564/is-there-a-cross-browser-solution-for-monitoring-when-the-document-activeelement
 *
 */

function FOO() {
  let lastActiveElement = document.activeElement;

  function detectBlur() {
    // Do logic related to blur using document.activeElement;
    // You can do change detection too using lastActiveElement as a history
    console.log('detectBlur');
  }

  function isSameActiveElement() {
    const currentActiveElement = document.activeElement;
    if (lastActiveElement !== currentActiveElement) {
      lastActiveElement = currentActiveElement;
      return false;
    }

    return true;
  }

  function detectFocus() {
    // Add logic to detect focus and to see if it has changed or not from the lastActiveElement.
    console.log('detectFocus');
  }

  function attachEvents() {
    window.addEventListener('focus', detectFocus, true);
    window.addEventListener('blur', detectBlur, true);
  }

  attachEvents();
}

FOO();
