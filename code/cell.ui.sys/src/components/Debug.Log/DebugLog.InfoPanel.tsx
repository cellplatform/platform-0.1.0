import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, time, t } from '../../common';
import { PropList, IPropListItem, ObjectView } from '../primitives';
import * as g from './types';

export type IDebugLogInfoPanelProps = {
  item: g.IDebugLogItem;
  style?: CssValue;
};
export type IDebugLogInfoPanelState = {
  selected?: { name: string; data: t.Object };
};

export class DebugLogInfoPanel extends React.PureComponent<
  IDebugLogInfoPanelProps,
  IDebugLogInfoPanelState
> {
  public state: IDebugLogInfoPanelState = {};
  private state$ = new Subject<Partial<IDebugLogInfoPanelState>>();
  private unmounted$ = new Subject();

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

  public componentDidUpdate(prev: IDebugLogInfoPanelProps) {
    if (prev.item.count !== this.props.item.count) {
      this.clearSelection();
    }
  }

  /**
   * [Methods]
   */
  public clearSelection() {
    this.state$.next({ selected: undefined });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Scroll: true,
        boxSizing: 'border-box',
        padding: 10,
        paddingTop: 15,
        paddingBottom: 80,
        PaddingX: 20,
      }),
    };

    const { item } = this.props;
    const data = item.data;
    const count = item.count;
    const timestamp = time.day(item.timestamp).format(`h:mm:ssa (SSS[ms])`);

    const items: IPropListItem[] = [
      { label: 'type', value: data.type },
      { label: 'timestamp', value: timestamp },
    ];

    const payload = Object.keys(data.payload).map((key) => {
      const value = data.payload[key];
      const item: IPropListItem = {
        label: key,
        value: toDisplayValue(value),
        onClick: this.valueClickHandler(key, value),
      };
      return item;
    });

    const { selected } = this.state;
    const elObject = selected && this.renderObject(selected);

    return (
      <div {...css(styles.base, this.props.style)}>
        <PropList title={`Event (${count})`} items={items} />
        <PropList.Space />
        <PropList title={'Payload'} items={payload} />
        {elObject}
      </div>
    );
  }

  private renderObject(props: { name: string; data: any }) {
    const { name } = props;
    const data = toDisplayObject(props.data);
    return (
      <React.Fragment>
        <PropList.Hr margin={24} />
        <ObjectView name={name} data={data} fontSize={11} expandLevel={1} />
      </React.Fragment>
    );
  }

  /**
   * Handlers
   */

  private valueClickHandler = (name: string, data: t.Object) => {
    if (!(Array.isArray(data) || typeof data === 'object')) {
      return undefined;
    }
    return () => {
      this.state$.next({ selected: { name, data } });
    };
  };
}

/**
 * [Helpers]
 */

function toDisplayValue(value: any) {
  if (Array.isArray(value)) {
    return `[...]`;
  }
  if (typeof value === 'object') {
    return `{...}`;
  }
  return value;
}

function toDisplayObject(object: any) {
  object = { ...object };

  Object.keys(object)
    .filter((key) => key.startsWith('_'))
    .forEach((key) => delete object[key]);

  return object;
}
