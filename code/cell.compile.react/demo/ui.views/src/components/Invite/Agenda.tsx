import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, style, color, CssValue, COLORS, defaultValue, time } from '../../common';

import { markdown } from '@platform/util.markdown';

export type IAgendaProps = {
  isExpanded?: boolean;
  style?: CssValue;
};
export type IAgendaState = {
  html?: string;
};

style.global({
  '.agenda-md': {
    // color: 'blue',
    lineHeight: '1.8em',
    fontSize: 14,
    // li: {
    //   color: 'red',
    // },
  },
});

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

    // time.delay(1200, () => {
    //   this.state$.next({ isExpanded: true });
    // });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * Methods
   */

  public async load() {
    const md = `
     
- Hello/catch up
- Review Deb's organisation strategy
- Talk about TEAM(DB), Phil, colloboration primitives etc.
- ...other emergent goodness...

     `;
    const html = await markdown.toHtml(md);
    this.state$.next({ html });
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
        flex: isExpanded ? 0 : 100,
        transition: `flex ${isExpanded ? 400 : 1000}ms ease-out`,
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
        // padding: 10,
        // PaddingX: 20,
        pointerEvents: 'auto',
        Absolute: [0, 20, 0, 20],

        color: COLORS.DARK,
        backgroundColor: color.format(0.9),

        borderRadius: '5px 5px 0 0',
        overflow: 'hidden',
        boxShadow: `0 0px 20px 0 ${color.format(-0.9)}`,
      }),
      body: css({
        // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        PaddingX: 8,
      }),
      title: css({
        position: 'relative',
        boxSizing: 'border-box',
        PaddingY: 8,
        PaddingX: 8,
        MarginX: 3,
        textAlign: 'center',
        userSelect: 'none',
        cursor: 'pointer',
      }),
      titleHr: css({
        //
        Absolute: [null, 0, -5, 0],
        height: 5,
        backgroundColor: color.format(-0.1),
      }),
      md: css({
        color: COLORS.DARK,
      }),
    };

    const { html } = this.state;
    const elMarkdown = html && (
      <div {...styles.md} className={'agenda-md'} dangerouslySetInnerHTML={{ __html: html }} />
    );

    return (
      <div {...styles.base}>
        <div {...styles.body}>
          <div {...styles.title}>
            <div>Agenda</div>
            <div {...styles.titleHr} />
          </div>

          {elMarkdown}
        </div>
      </div>
    );
  }
}
