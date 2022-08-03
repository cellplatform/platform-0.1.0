/* eslint-disable react/no-find-dom-node */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CssValue, css } from '@platform/css';

export type IMeasureSizeStyle = {
  width?: number;
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontStyle?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
};

export type IMeasureSizeProps = IMeasureSizeStyle & {
  content?: React.ReactNode;
  style?: CssValue;
};

const HIDDEN = {
  position: 'absolute',
  left: -999999,
  top: -999999,
};

/**
 * API for invisibly measuring text.
 */
class Measurer {
  public static create = (props: IMeasureSizeStyle) => {
    return {
      props,
      size: (content: React.ReactNode) => Measurer.measure({ ...props, content }),
    };
  };

  public static measure(props: IMeasureSizeProps) {
    const instance = new Measurer(props);
    const size = instance.size;
    instance.dispose();
    return size;
  }

  public props: IMeasureSizeProps;
  private div: HTMLDivElement;
  private component: MeasureSize;

  public constructor(props: IMeasureSizeProps) {
    this.props = props;
    this.div = document.createElement('DIV') as HTMLDivElement;
    document.body.appendChild(this.div);
    const ref = (el: MeasureSize) => (this.component = el);
    ReactDOM.render(<MeasureSize ref={ref} {...props} style={HIDDEN} />, this.div);
  }

  public dispose() {
    if (!this.isDisposed) {
      ReactDOM.unmountComponentAtNode(this.div);
      document.body.removeChild(this.div);
    }
  }

  public get isDisposed() {
    return !this.component;
  }

  public get width() {
    return this.component ? this.component.width : -1;
  }

  public get height() {
    return this.component ? this.component.height : -1;
  }

  public get size() {
    const width = this.width;
    const height = this.height;
    return { width, height };
  }
}

/**
 * Measures the length of the content accounting for font size and style.
 */
export class MeasureSize extends React.PureComponent<IMeasureSizeProps> {
  public static create = (props: IMeasureSizeStyle) => {
    return Measurer.create(props);
  };

  public static measure(props: IMeasureSizeProps) {
    return Measurer.measure(props);
  }

  private el: HTMLDivElement;

  public componentDidMount() {
    const el = ReactDOM.findDOMNode(this as any) as HTMLElement;
    this.el = el.firstChild as HTMLDivElement;
  }

  public get width() {
    return this.el ? this.el.offsetWidth : -1;
  }

  public get height() {
    return this.el ? this.el.offsetHeight : -1;
  }

  public get size() {
    const width = this.width;
    const height = this.height;
    return { width, height };
  }

  public render() {
    const {
      content,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      lineHeight,
      letterSpacing,
      width,
    } = this.props;
    const styles = {
      text: css({
        display: 'inline-block',
        fontFamily,
        fontSize,
        fontWeight: fontWeight as any,
        fontStyle,
        lineHeight,
        letterSpacing,
        width,
      }),
    };
    return (
      <div className={'platform.MeasureText'} {...css(this.props.style)}>
        <div {...styles.text}>{content}</div>
      </div>
    );
  }
}
