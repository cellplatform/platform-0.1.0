import { color, css, CssValue } from '@platform/css';
import { Button } from '@platform/ui.button';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TreeView } from '../..';
import { t, COLORS } from '../../common';
import { TextInput } from '@platform/ui.text/lib/components/TextInput';
import { TextInputChangeEventHandler } from '@platform/ui.text/lib/types';

const S = TreeView.State;

export type ITestStateStoreProps = {
  store: t.ITreeViewState;
  style?: CssValue;
};
export type ITestStateStoreState = {
  addLabel?: string;
};

export class TestStateStore extends React.PureComponent<
  ITestStateStoreProps,
  ITestStateStoreState
> {
  public state: ITestStateStoreState = {};
  private state$ = new Subject<Partial<ITestStateStoreState>>();
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.store.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.props.store;
  }

  /**
   * [Render]
   */
  public render() {
    const store = this.store;
    const styles = {
      base: css({
        boxSizing: 'border-box',
        backgroundColor: color.format(-0.02),
        border: `solid 1px ${color.format(-0.04)}`,
        borderRadius: 4,
        padding: 10,
        fontSize: 14,
        marginBottom: 10,
        ':last-child': { marginBottom: 0 },
      }),
      title: css({
        Flex: 'horizontal-center-spaceBetween',
      }),
      id: css({
        fontFamily: 'menlo, monospace',
        fontSize: 12,
        color: COLORS.PURPLE,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.title}>
          <div>
            <strong>TreeState</strong>
          </div>
          <div {...styles.id}>{store.id}</div>
        </div>
        {this.renderTools()}
        {store.children.length > 0 && this.renderChildren()}
      </div>
    );
  }

  private renderTools() {
    const styles = {
      base: css({
        marginTop: 10,
        Flex: 'horizontal-stretch-stretch',
      }),
      left: css({
        flex: 1,
      }),
      middle: css({ width: 20 }),
      right: css({ flex: 1 }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.left}>
          {this.renderInputButton({
            placeholder: 'label',
            // button: 'add',
            value: this.store.root.props?.label,
            // onClick: this.onLabelChange,
            onChange: this.onLabelChange,
          })}
        </div>
        <div {...styles.middle}></div>
        <div {...styles.right}>
          {this.renderInputButton({
            placeholder: 'child label',
            button: 'add',
            value: this.state.addLabel,
            onClick: this.addChild,
            onChange: this.onAddLabelChange,
          })}
        </div>
      </div>
    );
  }

  private renderInputButton(props: {
    placeholder?: string;
    value?: string;
    button?: string;
    onClick?: () => void;
    onChange?: TextInputChangeEventHandler;
  }) {
    const styles = {
      base: css({
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        Flex: 'horizontal',
      }),
      input: css({ flex: 1 }),
      button: css({ marginLeft: 8 }),
    };

    const value = props.value || '';
    const isEnabled = value.trim().length > 0;

    return (
      <div {...styles.base}>
        <TextInput
          style={styles.input}
          value={value}
          placeholder={props.placeholder}
          placeholderStyle={{ color: color.format(-0.3), italic: true }}
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize={false}
          autoComplete={false}
          autoSize={false}
          onEnter={isEnabled ? props.onClick : undefined}
          onChange={props.onChange}
        />
        {props.button && (
          <Button style={styles.button} onClick={props.onClick} isEnabled={isEnabled}>
            {props.button || 'Untitled'}
          </Button>
        )}
      </div>
    );
  }

  private renderChildren() {
    const styles = {
      base: css({
        marginTop: 30,
      }),
    };

    const elList = this.store.children.map((store) => {
      return <TestStateStore key={store.namespace} store={store} />;
    });

    return <div {...styles.base}>{elList}</div>;
  }

  /**
   * [Handlers]
   */

  private addChild = () => {
    const label = this.state.addLabel;
    const root = { id: 'foo', props: { label } };
    const child = this.store.add({ root });

    child.change((draft, ctx) => {
      const children = S.children(draft);
      children.push({ id: 'my-child', props: { label: 'hello' } });
    });

    this.state$.next({ addLabel: '' });
  };

  private onAddLabelChange: TextInputChangeEventHandler = (e) => {
    this.state$.next({ addLabel: e.to });
  };

  private onLabelChange: TextInputChangeEventHandler = (e) => {
    this.store.change((draft) => {
      S.props(draft, (props) => (props.label = e.to));
    });
  };
}
