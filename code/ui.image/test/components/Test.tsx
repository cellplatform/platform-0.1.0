import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, log, Avatar, constants, css, CommandShell, t, image, Hr } from '../common';

const Owl = image({
  x1: 'https://platform.sfo2.digitaloceanspaces.com/modules/ui.image/images/owl-big.png',
  x2: 'https://platform.sfo2.digitaloceanspaces.com/modules/ui.image/images/owl-big@2x.png',
  width: 449,
  height: 599,
});

const PINK = '#CD638D';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {
    src: constants.URL.WOMAN_1,
    size: 64,
    borderRadius: 8,
    borderWidth: 5,
    borderColor: 0.2,
  };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<t.ITestState>>();
  private events$ = new Subject<t.AvatarEvent>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      log.info('👱‍', e.type, e.payload);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: PINK,
        flex: 1,
        padding: 30,
      }),
    };

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <Avatar {...this.state} events$={this.events$} onClick={this.onAvatarClick} />
          <Hr thickness={5} margin={[35, 0]} />
          {this.renderImage()}
          {this.renderImage()}
        </div>
      </CommandShell>
    );
  }

  private renderImage() {
    const styles = {
      image: css({
        borderRadius: 8,
        border: `solid 1px ${color.format(0.8)}`,
        display: 'inline-block',
      }),
    };
    return <Owl style={styles.image} scale={0.8} onLoad={this.onImageLoaded} />;
  }

  /**
   * [Handlers]
   */
  private onAvatarClick = () => {
    log.info('AVATAR/click');
  };

  private onImageLoaded = (e: t.IImageLoad) => {
    log.info('IMAGE/onLoad:', e);
  };
}
