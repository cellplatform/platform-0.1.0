import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { loader, color, COLORS, css, GlamorValue, t, time, log } from '../common';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type IComponentAProps = { style?: GlamorValue };
export type IComponentAState = {
  more?: string[];
};

export class ComponentA extends React.PureComponent<IComponentAProps, IComponentAState> {
  public state: IComponentAState = {};
  private state$ = new Subject<Partial<IComponentAState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = loader.Context;
  public context!: t.IMyContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IComponentAProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public async componentDidMount() {
    log.group('🌳 module.A');
    log.info('context', this.context);
    log.groupEnd();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get loader() {
    return this.context.loader;
  }

  public get theme() {
    return this.context.theme;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        padding: 30,
        color: this.theme === 'DARK' ? COLORS.WHITE : COLORS.DARK,
      }),
      buttons: css({
        marginLeft: 30,
      }),
    };

    const elSplash = this.renderSplash();

    return (
      <div {...css(styles.base, this.props.style)}>
        <div>
          <strong>Dynamic load (Module A):</strong>
          <div {...styles.buttons}>
            <Button label={'Load more'} onClick={this.loadMore} />
            <Button
              label={'Show splash (spinning)'}
              onClick={this.showSplash({ isSpinning: true, timeout: 1500 })}
            />
            <Button label={'Show splash (el)'} onClick={this.showSplash({ el: elSplash })} />
          </div>
          <p>{LOREM}</p>
          {(this.state.more || []).map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </div>
      </div>
    );
  }

  private renderSplash() {
    const isDark = this.theme === 'DARK';
    const styles = {
      base: css({
        padding: 30,
        minWidth: 300,
        backgroundColor: color.format(isDark ? 0.08 : -0.04),
        border: `dashed 1px ${color.format(isDark ? 0.2 : -0.2)}`,
        borderRadius: 5,
      }),
    };
    return (
      <div {...styles.base} onClick={this.hideSplash}>
        <div>My splash component</div>
        <div>
          <Button label={'Hide'} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private loadMore = async () => {
    const res = await this.loader.load<string[]>('B');
    if (res.result) {
      const more = [...(this.state.more || []), ...res.result];
      this.state$.next({ more });
    }
  };

  private showSplash = (args: { isSpinning?: boolean; el?: JSX.Element; timeout?: number }) => {
    return () => {
      const { isSpinning, el, timeout } = args;
      const splash = this.context.splash;
      splash.isVisible = true;
      splash.isSpinning = isSpinning;
      splash.el = el;
      if (timeout) {
        time.delay(timeout, () => this.hideSplash());
      }
    };
  };

  private hideSplash = () => {
    const splash = this.context.splash;
    splash.isVisible = false;
    splash.isSpinning = false;

    time.delay(200, () => {
      splash.el = undefined;
    });
  };
}

/**
 * [Helpers]
 */

const Button = (props: { label?: React.ReactNode; onClick?: () => void }) => {
  const styles = {
    base: css({
      display: 'inline-block',
      marginTop: 15,
      marginRight: 20,
      color: '#FF0067',
      cursor: 'pointer',
      userSelect: 'none',
    }),
  };
  return (
    <div {...styles.base} onClick={props.onClick}>
      {props.label}
    </div>
  );
};
