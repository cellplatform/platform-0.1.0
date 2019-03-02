import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, css, GlamorValue, IMAGES, t } from '../../common';
import { TextInput, TextInputChangeEvent } from '../primitives';

export type IDbHeaderProps = {
  db: t.ITestRendererDb;
  style?: GlamorValue;
};

export type IDbHeaderState = {
  name?: string;
};

export class DbHeader extends React.PureComponent<IDbHeaderProps, IDbHeaderState> {
  public state: IDbHeaderState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<IDbHeaderState>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDbHeaderProps) {
    super(props);
    const { db } = this.props;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    db.watch$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.updateState());
    db.watch();
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get isPrimary() {
    const { db } = this.props;
    return db.key === db.localKey;
  }

  /**
   * [Methods]
   */
  public async updateState() {
    const { db } = this.props;
    const name = (await db.get('.sys/dbname')).value;
    this.state$.next({ name });
  }

  /**
   * [Render]
   */
  public render() {
    const { db } = this.props;
    const isPrimary = this.isPrimary;

    const styles = {
      base: css({
        boxSizing: 'border-box',
        marginBottom: 40,
        Flex: 'horizontal-start-center',
      }),
      iconOuter: css({
        position: 'relative',
        marginRight: 10,
      }),
      icon: css({
        position: 'relative',
        Image: [IMAGES.DB, IMAGES.DB2x, 38, 38],
      }),
      typeBadge: css({
        Absolute: [null, 0, -18, 0],
        backgroundColor: color.format(-0.1),
        color: color.format(-0.4),
        border: `solid 1px ${color.format(-0.06)}`,
        borderRadius: 2,
        padding: 2,
        paddingBottom: 1,
        fontSize: 7,
        fontWeight: 'bold',
        textAlign: 'center',
      }),
      body: css({
        flex: 1,
        borderBottom: `solid 8px ${color.format(-0.08)}`,
        paddingBottom: 6,
      }),
      textbox: css({
        // borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      keyOuter: css({
        fontFamily: 'monospace',
        fontSize: 11,
        fontWeight: 'bold',
        color: color.format(-0.2),
        marginTop: 3,
      }),
      key: css({
        color: isPrimary ? COLORS.CLI.PURPLE : COLORS.CLI.CYAN,
      }),
    };
    const elPublicKey = <span {...styles.key}>{db.key}</span>;
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.iconOuter}>
          <div {...styles.icon} />
          <div {...styles.typeBadge}>{isPrimary ? 'PRIMARY' : 'PEER'}</div>
        </div>
        <div {...styles.body}>
          <TextInput
            style={styles.textbox}
            onChange={this.handleNameChange}
            value={this.state.name}
            valueStyle={{ fontSize: 22, color: color.format(-0.7) }}
            placeholder={'Unnamed'}
            placeholderStyle={{ color: color.format(-0.2) }}
          />
          <div {...styles.keyOuter}>{elPublicKey} (public-key)</div>
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */

  private handleNameChange = async (e: TextInputChangeEvent) => {
    const { db } = this.props;
    await db.put('.sys/dbname', e.to);
  };
}
