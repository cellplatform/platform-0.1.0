import { copyToClipboard } from '@platform/react/lib/util';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, t, ui, Uri } from '../../common';
import { Card, PropList, IPropListItemEventArgs } from '../primitives';

export type IHelpersCardProps = { style?: CssValue };
export type IHelpersCardState = t.Object;

export class HelpersCard extends React.PureComponent<IHelpersCardProps, IHelpersCardState> {
  public state: IHelpersCardState = {};
  private state$ = new Subject<Partial<IHelpersCardState>>();
  private unmounted$ = new Subject<void>();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
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
      base: css({ display: 'flex' }),
      card: css({
        PaddingX: 15,
        PaddingY: 15,
      }),
      icon: css({ Absolute: [10, 15, null, null] }),
    };

    const items: t.IPropListItem[] = [
      { label: 'namespace uri', value: 'generate', onClick: this.onGenerateNs },
    ];

    return (
      <div {...styles.base}>
        <Card padding={0} style={{ flex: 1 }}>
          <div {...styles.card}>
            <PropList title={'Helpers'} items={items} />
          </div>
        </Card>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private onGenerateNs = (e: IPropListItemEventArgs) => {
    const ns = Uri.create.ns(Uri.cuid());
    copyToClipboard(ns);
    e.message('copied uri');
  };
}
