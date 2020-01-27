import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IStackPanel, StackPanel, StackPanelSlideEvent } from '../../src';
import { color, css, Foo, CssValue, Button } from './common';

const TestPanel = (props: { label: string }) => (
  <Foo style={{ flex: 1, margin: 5 }} children={props.label} />
);

const PANELS: IStackPanel[] = [
  { el: <TestPanel label={'one'} />, offsetOpacity: 0 },
  { el: <TestPanel label={'two'} />, offsetOpacity: 0 },
  { el: <TestPanel label={'three'} />, offsetOpacity: 0 },
];

export type ITestProps = { style?: CssValue };
export type ITestState = {
  index?: number;
  panels?: IStackPanel[];
};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = { panels: [PANELS[0]] };
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestState>>();

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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Flex: 'horizontal',
      }),
      left: css({
        lineHeight: 1.5,
        width: 180,
      }),
    };

    const elIndexButtons = Array.from({ length: PANELS.length }).map((v, i) => (
      <div key={i}>{this.indexButton(i)}</div>
    ));

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.left}>{elIndexButtons}</div>
        {this.renderBody()}
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        background: color.format(-0.03),
        border: `solid 1px ${color.format(-0.1)}`,
      }),
      panel: css({
        width: 350,
        display: 'flex',
        boxSizing: 'border-box',
        background: 'white',
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.panel}>
          <StackPanel
            panels={this.state.panels}
            index={this.state.index}
            style={styles.panel}
            onSlide={this.handleSlide}
          />
        </div>
      </div>
    );
  }

  private indexButton = (index: number) => {
    const onClick = () => {
      let panels = this.state.panels || [];
      if (index > panels.length - 1) {
        panels = PANELS.slice(0, index + 1);
      }
      this.state$.next({ index, panels });
    };

    return <div>{this.button(`index: ${index}`, onClick)}</div>;
  };

  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} />;
  };

  private handleSlide = (e: StackPanelSlideEvent) => {
    // console.log('!! onSlide', e);
  };
}
