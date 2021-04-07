/* eslint-disable @typescript-eslint/no-use-before-define */

import * as React from 'react';

import { TextProps, toTextCss, toTextShadow, constants } from '../../common';

import { css } from '@platform/css';
import { MeasureSize } from '@platform/react';

/**
 * <Text> component with a monospace font-face.
 */
export class Monospace extends React.PureComponent<TextProps> {
  public measure() {
    return Text.measure(this.props);
  }

  public render() {
    return <Text fontFamily={constants.MONOSPACE.FAMILY} {...this.props} />;
  }
}

/**
 * Standard text styled component.
 */
export class Text extends React.PureComponent<TextProps> {
  public static toTextCss = toTextCss;
  public static toShadow = toTextShadow;
  public static Monospace = Monospace;
  public static measure = (props: TextProps) => {
    const { children: content } = props;
    const style = { ...toTextCss(props), ...props.style };
    return MeasureSize.measure({ content, ...style });
  };

  /**
   * Measure the current size of the text (width/height).
   */
  public get size() {
    return Text.measure(this.props);
  }

  public render() {
    const { block = false, isSelectable = true, cursor = 'default' } = this.props;
    const styles = {
      base: css({
        display: block ? 'block' : 'inline-block',
        cursor,
        userSelect: isSelectable ? 'auto' : 'none',
        ...toTextCss(this.props),
      }),
    };

    return (
      <div
        className={this.props.className}
        {...css(styles.base, this.props.style)}
        title={this.props.tooltip}
        onClick={this.props.onClick}
        onDoubleClick={this.props.onDoubleClick}
        onMouseDown={this.props.onMouseDown}
        onMouseUp={this.props.onMouseUp}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        {this.props.children}
      </div>
    );
  }
}
