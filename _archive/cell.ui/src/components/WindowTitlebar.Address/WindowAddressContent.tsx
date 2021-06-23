import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { color, css, CssValue, ui, t, Uri, COLORS } from '../common';

export type IWindowAddressContentProps = {
  address?: React.ReactNode;
  style?: CssValue;
};
export type IWindowAddressContentState = {
  addressType?: t.IClientTypesystemImplements;
};

export class WindowAddressContent extends React.PureComponent<
  IWindowAddressContentProps,
  IWindowAddressContentState
> {
  public state: IWindowAddressContentState = {};
  private state$ = new Subject<Partial<IWindowAddressContentState>>();
  private unmounted$ = new Subject<void>();

  public static contextType = ui.Context;
  public context!: t.IEnvContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IWindowAddressContentProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
    this.updateState();
  }

  public componentDidUpdate(prev: IWindowAddressContentProps) {
    if (prev.address !== this.props.address) {
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

  public get addressText() {
    return this.props.address?.toString() || '';
  }

  public get addressTypeText() {
    const typeDefs = this.state.addressType?.typeDefs || [];
    if (typeDefs.length === 0) {
      return '';
    } else {
      const first = typeDefs[0].typename;
      return typeDefs.length === 1 ? first : `${first}[${typeDefs.length}]`;
    }
  }

  /**
   * [Methods]
   */
  public async updateState() {
    this.updateTypeDefs();
  }

  public async updateTypeDefs() {
    const client = this.context.client;
    const text = this.addressText;
    const addressType = !Uri.is.uri(text) ? undefined : await client.implements(Uri.toNs(text));
    this.state$.next({ addressType });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'center-center',
        boxSizing: 'border-box',
        color: COLORS.DARK,
        PaddingX: 10,
      }),
      label: css({
        opacity: 0.8,
        Flex: 'horizontal-center-center',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.label}>
          {this.props.address}
          {this.renderTypeName()}
        </div>
      </div>
    );
  }

  private renderTypeName() {
    const text = this.addressTypeText;
    if (!text) {
      return null;
    }
    const styles = {
      base: css({
        fontSize: 10,
        color: color.format(1),
        backgroundColor: color.format(-0.35),
        borderRadius: 3,
        marginLeft: 6,
        PaddingX: 5,
        PaddingY: 2,
      }),
    };
    return <div {...styles.base}>{text}</div>;
  }
}
