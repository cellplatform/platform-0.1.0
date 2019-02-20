import {
  React,
  css,
  ITextProps,
  toTextCss,
  toShadow,
  constants,
  MouseEvent,
  MouseEventHandler,
  mouse,
  MeasureSize,
} from '../../common';

export { ITextProps, MouseEvent, MouseEventHandler };

/**
 * <Text> component with a monospace font-face.
 */
export class Monospace extends React.PureComponent<ITextProps> {
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
export class Text extends React.PureComponent<ITextProps> {
  public static toTextCss = toTextCss;
  public static toShadow = toShadow;
  public static Monospace = Monospace;
  public static measure = (props: ITextProps) => {
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

  private mouse = mouse.fromProps(this.props);

  public render() {
    const {
      block = false,
      isSelectable = true,
      cursor = 'default',
    } = this.props;
    const styles = {
      base: css({
        display: block ? 'block' : 'inline-block',
        cursor,
        userSelect: !isSelectable && 'none',
        ...toTextCss(this.props),
      }),
    };
    return (
      <div
        className={this.props.className}
        {...css(styles.base, this.props.style)}
        title={this.props.tooltip}
        {...this.mouse.events}
      >
        {this.props.children}
      </div>
    );
  }
}
