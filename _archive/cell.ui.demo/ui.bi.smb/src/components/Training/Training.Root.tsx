import * as React from 'react';
import { COLORS, css, CssValue } from '../../common';

export type TrainingIRootProps = { nodeId: string; style?: CssValue };

export class TrainingRoot extends React.PureComponent<TrainingIRootProps> {
  /**
   * [Render]
   */
  public render() {
    const { nodeId: node } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>{node === 'intro' && this.renderIntro()}</div>
    );
  }

  private renderIntro() {
    const styles = {
      base: css({
        Flex: 'center-center',
        color: COLORS.WHITE,
        Absolute: 0,
      }),
    };
    return <div {...styles.base}></div>;
  }
}
