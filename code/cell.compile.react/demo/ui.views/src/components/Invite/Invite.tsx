import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, client, Client, http } from '../../common';

export type IInviteProps = { style?: CssValue };
export type IInviteState = {};

export class Invite extends React.PureComponent<IInviteProps, IInviteState> {
  public state: IInviteState = {};
  private state$ = new Subject<Partial<IInviteState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IInviteProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));

    this.tmp();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */
  public async tmp() {
    // console.log('client', client);

    const host = 'dev.db.team';
    const uri = 'cell:ck5st4aop0000ffet9pi2fkvp!B1';

    const client = Client.create(host);
    const cellClient = client.cell(uri);

    // client.

    const url = 'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1';
    // const r = await http.get(url);
    // console.log('r', r);
    // console.log('r.body', r.body);

    // console.log('url', url);
    // console.log('r.text', r.text);
    // console.log('r.contentType', r.contentType);
    // console.log('r.headers', r.headers);

    // const rr = await fetch(url);
    // console.log('rr', rr);

    // const cellClient = client.cell(uri);

    try {
      const res = await cellClient.info();
      console.log('res', res);
    } catch (error) {
      console.log('error', error);
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };

    const src = 'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1/file:39400bt.jpg';

    return (
      <div {...css(styles.base, this.props.style)}>
        <div>Invite</div>

        <img src={src} />
      </div>
    );
  }
}
