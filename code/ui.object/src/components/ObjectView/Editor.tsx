import * as React from 'react';
import { css, color, FONT_FAMILY, DEFAULTS } from '../../common';

export type IEditorProps = {
  fontSize?: number;
};

/**
 * An editor input for an object value.
 */
export class Editor extends React.PureComponent<IEditorProps, {}> {
  public input: HTMLInputElement;
  private inputRef = (ref: HTMLInputElement) => (this.input = ref);

  public render() {
    const { fontSize = DEFAULTS.FONT_SIZE } = this.props;

    const styles = {
      input: css({
        fontSize,
      }),
    };

    return (
      <div {...STYLES.base}>
        <input ref={this.inputRef} {...css(STYLES.input, styles.input)} />
      </div>
    );
  }
}

/**
 * INTERNAL
 */
const STYLES = {
  base: css({
    position: 'relative',
    boxSizing: 'border-box',
    display: 'inline-block',
    background: 'white',
    border: `solid 1px ${color.format(-0.15)}`,
    borderRadius: 1,
    boxShadow: `0 1px 3px 0 ${color.format(-0.1)}`,
  }),
  input: css({
    position: 'relative',
    border: 'none',
    width: '100%',
    outline: 'none',
    background: 'transparent',
    fontFamily: FONT_FAMILY,
  }),
};
