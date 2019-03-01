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
        paddingBottom: 16,
        Flex: 'horizontal-center-center',
      }),
      icon: css({
        position: 'relative',
        Image: [IMAGES.DB, IMAGES.DB2x, 38, 38],
        marginRight: 10,
        top: 3,
      }),
      body: css({
        flex: 1,
        // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        // height: 50,
      }),
      textbox: css({
        // borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      key: css({
        fontFamily: 'monospace',
        fontSize: 11,
        fontWeight: 'bold',
        color: color.format(-0.2),
        marginTop: 3,
        marginLeft: 4,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.icon} />
        <div {...styles.body}>
          <TextInput
            style={styles.textbox}
            onChange={this.handleChange}
            valueStyle={{ fontSize: 22 }}
            placeholder={'Unnamed'}
            placeholderStyle={{ color: color.format(-0.2) }}
          />
          <div {...styles.key}>
            public-key: 4173e6d24fdc4c22f8666081226d7877d032bf955a508047f7e8b1483e202a7c (primary)
          </div>
        </div>
      </div>
    );
  }

  private handleChange = (e: TextInputChangeEvent) => {
    console.log('e', e);
  };
}
