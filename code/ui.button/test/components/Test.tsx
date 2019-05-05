import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, COLORS, log, Button, css, CommandShell, t, value, Hr } from '../common';
import { Icons } from './Icons';

export type ITestProps = {};

const orange = Button.theme.BORDER.SOLID;
orange.backgroundColor.enabled = '#F6A623';
orange.color.enabled = -0.7;

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const isEnabled = value.defaultValue(this.state.isEnabled, true);
    const styles = {
      base: css({
        flex: 1,
        padding: 30,
      }),
      iconContent: css({
        Flex: 'horizontal-center-center',
      }),
      centerY: css({
        Flex: 'horizontal-start-start',
      }),
    };

    const common = {
      isEnabled,
      onClick: this.handleClick,
      margin: [null, 10, null, null],
    };

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <Button {...common} label={'Click Me'} />

          <PinkDashed />

          <div {...styles.centerY}>
            <Button {...common} margin={[0, 20, 0, 0]}>
              {this.iconButtonContent({ label: 'Foo' })}
            </Button>
            <Button {...common} margin={[0, 20, 0, 0]}>
              {this.iconButtonContent({ label: 'Bar' })}
            </Button>
            <Button {...common}>{this.iconButtonContent({ color: COLORS.BLUE })}</Button>
          </div>

          <PinkDashed />

          <div {...styles.centerY}>
            <Button {...common} label={'Base Border'} theme={Button.theme.BORDER.BASE} />
            <Button
              {...common}
              label={'Down Theme'}
              theme={Button.theme.BORDER.BASE}
              downTheme={orange}
            />
            <Button
              {...common}
              label={'Blue Over'}
              theme={Button.theme.BORDER.BASE}
              overTheme={Button.theme.BORDER.BLUE}
            />
            <Button {...common} label={'Blue'} theme={Button.theme.BORDER.BLUE} />
            <Button {...common} theme={Button.theme.BORDER.BLUE}>
              {this.iconButtonContent({ label: 'Blue Icon', color: 1 })}
            </Button>
          </div>
          <PinkDashed />
          <div {...styles.centerY}>
            <Button {...common} label={'Green'} theme={Button.theme.BORDER.GREEN} />
            <Button {...common} label={'Dark'} theme={Button.theme.BORDER.DARK} />
          </div>

          <PinkDashed />

          <div {...styles.centerY}>
            <Button
              {...common}
              label={'minWidth: 250'}
              theme={Button.theme.BORDER.BASE}
              minWidth={250}
            />
            <Button
              {...common}
              label={'minWidth: 250'}
              theme={Button.theme.BORDER.BLUE}
              minWidth={250}
            />
          </div>
        </div>
      </CommandShell>
    );
  }

  private iconButtonContent(props: { label?: string; color?: number | string }) {
    const { label } = props;
    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
      icon: css({
        marginRight: label && 3,
      }),
    };
    const elLabel = label && <div>{props.label}</div>;
    return (
      <div {...styles.base}>
        <Icons.Face style={styles.icon} color={color.format(props.color)} />
        {elLabel}
      </div>
    );
  }

  private handleClick = () => {
    log.info('click');
  };
}

const PinkDashed = () => <Hr.PinkDashed margin={[40, 0]} />;
