import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, t, style, color, CssValue, COLORS, defaultValue, time } from '../../common';

import { Button, Icons } from '../primitives';
import { AgendaList } from './AgendaList';

export type IAgendaProps = {
  isExpanded?: boolean;
  style?: CssValue;
  onExpandClick?: (e: { isExpanded: boolean }) => void;
};
export type IAgendaState = {
  items?: t.IAgendaItem[];
};

export class Agenda extends React.PureComponent<IAgendaProps, IAgendaState> {
  public state: IAgendaState = {};
  private state$ = new Subject<Partial<IAgendaState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IAgendaProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.load();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Methods
   */

  public async load() {
    const agenda = `
     
      - Hello/catch up
      - Review Deb's organisation strategy
      - Talk TEAM(DB), Phil, colloboration primitives, "subtle space engineering" etc.
      - ...any other emergent goodness...

     `;

    const items: t.IAgendaItem[] = agenda
      .trim()
      .replace(/^\n*/, '')
      .replace(/\n*$/, '')
      .split('\n')
      .map(detail =>
        detail
          .trim()
          .replace(/^-/, '')
          .trim(),
      )
      .map(detail => ({ detail }));

    this.state$.next({ items });
  }

  /**
   * [Render]
   */
  public render() {
    const { isExpanded = false } = this.props;

    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'vertical-stretch-stretch',
      }),
      top: css({
        minHeight: 40,
        flex: isExpanded ? 0 : 1000,
        // transition: `flex ${isExpanded ? 400 : 400}ms ease-out`,
      }),
      body: css({
        position: 'relative',
        minHeight: 34,
        flex: 1,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.top} />
        <div {...styles.body}>{this.renderBody({})}</div>
      </div>
    );
  }

  private renderBody(props: {} = {}) {
    const styles = {
      base: css({
        boxSizing: 'border-box',
        pointerEvents: 'auto',
        Absolute: [0, 20, 0, 20],

        color: COLORS.DARK,
        backgroundColor: color.format(0.9),

        borderRadius: '5px 5px 0 0',
        overflow: 'hidden',
        boxShadow: `0 0px 20px 0 ${color.format(-0.9)}`,
      }),
      body: css({ PaddingX: 8 }),
      md: css({ color: COLORS.DARK }),
    };

    // const { html } = this.state;
    // const elList = html && <div {...styles.md} dangerouslySetInnerHTML={{ __html: html }} />;

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          {this.renderTitle({})}
          <AgendaList items={this.state.items} />
        </div>
      </div>
    );
  }

  private renderTitle(props: { text?: string } = {}) {
    const { text = 'Agenda' } = props;
    const { isExpanded = false } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        PaddingY: 8,
        PaddingX: 8,
        MarginX: 0,
        marginBottom: 8,
        textAlign: 'center',
        userSelect: 'none',
        cursor: 'pointer',
      }),
      hr: css({
        Absolute: [null, 0, -5, 0],
        height: 5,
        backgroundColor: color.format(-0.1),
      }),
      closeButton: css({
        Absolute: [5, 0, null, null],
      }),
    };

    const elExpand = !isExpanded && <Icons.ChevronUp />;
    const elClose = isExpanded && <Icons.ChevronDown />;

    return (
      <div {...styles.base} onClick={this.expandHandler(!isExpanded)}>
        <div {...styles.hr} />
        <div>{text}</div>
        <Button style={styles.closeButton}>
          <div>
            {elExpand}
            {elClose}
          </div>
        </Button>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private expandHandler = (isExpanded: boolean) => {
    return () => {
      const { onExpandClick } = this.props;
      if (onExpandClick) {
        onExpandClick({ isExpanded });
      }
    };
  };
}
