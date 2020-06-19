import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as t from '../../types';
import { color, css, CssValue, ui, constants, TreeUtil } from '../../common';
import { Page, HeaderToolClickEvent } from '../primitives';
import { INode } from '../../types';
import { Chart } from './Chart';

import { Button } from '../primitives';

export type ITrainingVideoProps = {
  node: string;
  root: t.INode;
  style?: CssValue;
};
export type ITrainingVideoState = {
  node?: INode;
};

export class TrainingVideo extends React.PureComponent<ITrainingVideoProps, ITrainingVideoState> {
  public state: ITrainingVideoState = {};
  private state$ = new Subject<Partial<ITrainingVideoState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.updateState();
  }

  public componentDidUpdate(prevProps: ITrainingVideoProps) {
    if (prevProps.node !== this.props.node) {
      this.updateState();
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.context.getState();
  }

  public get root() {
    return this.props.root;
  }

  public get depth() {
    const { node } = this.state;
    const depth = node ? TreeUtil.depth(this.root, node) - 1 : 0;
    return Math.max(depth, 0);
  }

  public get title() {
    const { node } = this.state;
    const root = this.root;
    if (!node || !root) {
      return '';
    }

    const labels: string[] = [];
    TreeUtil.walkUp(root, node, (e) => {
      const label = e.node.props?.label;
      if (e.parent && label) {
        labels.push(label);
      }
    });

    return labels.reverse().join(' / ');
  }

  public get headline() {
    const label = this.state.node?.props?.label;
    return label || 'Loading...';
  }

  public get data(): t.INodeDataDoc | undefined {
    const data = this.state.node?.data;
    return data && data.type === 'DOC' ? data : undefined;
  }

  /**
   * [Methods]
   */
  private updateState() {
    const root = this.root;
    const node = TreeUtil.findById<t.INode>(root, this.props.node);
    this.state$.next({ node });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: color.format(0.2),
        flex: 1,
        padding: 10,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <Page.Container
          header={{
            title: this.title,
            onToolClick: this.onHeaderToolClick,
          }}
        >
          {this.renderContent()}
        </Page.Container>
      </div>
    );
  }

  private renderContent() {
    const data = this.data;
    if (!data) {
      return null;
    }
    return (
      <React.Fragment>
        <Page.Video src={data.video || ''} />
        <Page.Body>
          <Page.Headline>{this.headline}</Page.Headline>
          {this.renderDetailOptions()}
          <Page.Paragraph>{constants.LOREM}</Page.Paragraph>
          <Chart style={{ marginTop: 30, marginBottom: 50 }} />
          <Page.Paragraph>{constants.LOREM}</Page.Paragraph>
          <Page.Paragraph>{constants.LOREM}</Page.Paragraph>
          <Page.Paragraph>{constants.LOREM}</Page.Paragraph>
        </Page.Body>
      </React.Fragment>
    );
  }

  private renderDetailOptions() {
    const styles = {
      base: css({
        marginBottom: 20,
        borderTop: `solid 1px ${color.format(-0.1)}`,
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        PaddingY: 10,
        Flex: 'center-end',
      }),
      div: css({
        backgroundColor: color.format(-0.2),
        height: 24,
        width: 1,
        MarginX: 10,
      }),
    };
    return (
      <div {...styles.base}>
        <Button onClick={this.onMoreDetailClick}>More Detail</Button>
        <div {...styles.div} />
        <Button>Download PDF</Button>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onHeaderToolClick = (e: HeaderToolClickEvent) => {
    if (e.tool === 'CLOSE') {
      const { node } = this.props;
      this.context.fire({ type: 'APP:FINDER/tree/select/parent', payload: { node } });
    }
  };

  private onMoreDetailClick = () => {
    this.context.fire({
      type: 'APP:FINDER/tree/select',
      payload: { node: 'training.purpose.detail' },
    });
  };
}
