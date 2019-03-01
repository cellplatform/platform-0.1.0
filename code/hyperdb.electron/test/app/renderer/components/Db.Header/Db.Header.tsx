import * as React from 'react';
import { css, color, GlamorValue, IMAGES } from '../../common';
import { TextInput, TextInputChangeEventHandler, TextInputChangeEvent } from '../primitives';

export type IDbHeaderProps = {
  style?: GlamorValue;
};

export class DbHeader extends React.PureComponent<IDbHeaderProps> {
  constructor(props: IDbHeaderProps) {
    super(props);
  }

  public render() {
    const styles = {
      base: css({
        boxSizing: 'border-box',
        borderBottom: `solid 8px ${color.format(-0.08)}`,
        marginBottom: 20,
        paddingBottom: 10,
        Flex: 'horizontal-center-center',
      }),
      icon: css({
        Image: [IMAGES.DB, IMAGES.DB2x, 38, 38],
        marginRight: 10,
      }),
      body: css({
        flex: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        height: 50,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.icon} />
        <div {...styles.body}>
          <TextInput onChange={this.handleChange} />
        </div>
      </div>
    );
  }

  private handleChange = (e: TextInputChangeEvent) => {
    console.log('e', e);
  };
}
