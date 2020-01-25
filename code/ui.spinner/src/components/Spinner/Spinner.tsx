import * as React from 'react';

import { css, CssValue, color as colorUtil } from '../../common';
import { RenderStyleOnce } from './Style';
import { SpinnerConfig } from './types';

type ISpinnerProps = {
  color?: string | number;
  size?: 12 | 18 | 22 | 32;
  style?: CssValue;
};
type ISpinnerState = {
  started?: number;
};

const SUPPORTED = {
  SIZE: [12, 18, 22, 32],
};

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
    const size = this.size;
    const styles = {
      base: css({
        display: 'inline-block',
        position: 'relative',
        width: size,
        height: size,
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
    const { size = 22 } = this.props;
    if (!SUPPORTED.SIZE.includes(size)) {
      throw new Error(`Spinner size '${size}' not supported.`);
    }
    return size;
  }

  private get config(): SpinnerConfig {
    const { color = -1 } = this.props;
    let result: SpinnerConfig = {
      animation: 'spinner-line-fade-quick',
      color: colorUtil.format(color),
      corners: 1,
    };

    switch (this.size) {
      case 12:
        result = {
          ...result,
          width: 1.5,
          radius: 2.5,
          length: 2,
          lines: 8,
        };
        break;
      case 18:
        result = {
          ...result,
          width: 2,
          radius: 3.5,
          length: 3,
          lines: 10,
        };
        break;
      case 22:
        result = {
          ...result,
          width: 2,
          radius: 5,
          length: 4,
          lines: 12,
        };
        break;
      case 32:
        result = {
          ...result,
          width: 3,
          radius: 7,
          length: 6,
          lines: 12,
        };
        break;
    }

    return result;
  }

  private get isStarted() {
    const count = this.state.started || 0;
    return count > 0;
  }

  private start = () => {
    this.stop();
    const Base = require('../../spin');
    this.spinner = new Base.Spinner(this.config).spin(this.el);
    this.setState({ started: (this.state.started || 0) + 1 });
  };

  private stop = () => {
    if (this.spinner) {
      this.spinner.stop();
    }
  };
}
