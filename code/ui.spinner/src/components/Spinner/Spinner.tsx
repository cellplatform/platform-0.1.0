import * as React from 'react';

import { css, GlamorValue, color as colorUtil } from '../../common';
import { RenderStyleOnce } from './Style';
import { SpinnerConfig } from './types';

export interface ISpinnerProps {
  color?: string | number;
  size?: 'SMALL' | 'MEDIUM' | 'LARGE';
  style?: GlamorValue;
}
export interface ISpinnerState {
  started?: number;
}

/**
 * Spin.js component.
 */
export class Spinner extends React.PureComponent<ISpinnerProps, ISpinnerState> {
  public state: ISpinnerState = {};
  private el: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);
  private spinner: any;

  public componentDidMount() {
    this.start();
  }

  public componentWillUnmount() {
    this.stop();
  }

  public componentDidUpdate(prev: ISpinnerProps) {
    const props = this.props;
    let restart = false;
    restart = props.color === prev.color ? restart : true;
    restart = props.size === prev.size ? restart : true;
    if (restart) {
      this.start();
    }
  }

  public render() {
    const pixelSize = this.pixelSize;
    const styles = {
      base: css({
        display: 'inline-block',
        position: 'relative',
        width: pixelSize,
        height: pixelSize,
      }),
    };

    // NOTE: ignored because [ReactDOM.createPortal] creating type problem.
    // @ts-ignore
    const elStyle = this.isStarted && <RenderStyleOnce />;

    return (
      <div ref={this.elRef} {...css(styles.base, this.props.style)}>
        {elStyle}
      </div>
    );
  }

  private get size() {
    const { size = 'MEDIUM' } = this.props;
    return size;
  }

  private get pixelSize() {
    switch (this.size) {
      case 'SMALL':
        return 12;
      case 'MEDIUM':
        return 22;
      case 'LARGE':
        return 32;
      default:
        throw new Error(`Spinner size '${this.size}' not supported.`);
    }
  }

  private get config(): SpinnerConfig {
    const { color = -1 } = this.props;
    let result: SpinnerConfig = {
      animation: 'spinner-line-fade-quick',
      color: colorUtil.format(color),
      corners: 1,
    };

    switch (this.size) {
      case 'SMALL':
        result = {
          ...result,
          width: 2,
          radius: 3,
          length: 3,
          lines: 8,
        };
        break;
      case 'MEDIUM':
        result = {
          ...result,
          width: 2,
          radius: 5,
          length: 4,
          lines: 12,
        };
        break;
      case 'LARGE':
        result = {
          ...result,
          width: 3,
          radius: 7,
          length: 6,
          lines: 12,
        };
        break;
      default:
        break; // Ignore.
    }

    return result;
  }

  private get isStarted() {
    const count = this.state.started || 0;
    return count > 0;
  }

  private start = () => {
    this.stop();
    const Base = require('../../../spin.js');
    this.spinner = new Base.Spinner(this.config).spin(this.el);
    this.setState({ started: (this.state.started || 0) + 1 });
  };

  private stop = () => {
    if (this.spinner) {
      this.spinner.stop();
    }
  };
}
