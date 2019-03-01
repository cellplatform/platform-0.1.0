import * as React from 'react';

import { color, css, GlamorValue, IMAGES, t, COLORS } from '../../common';
import { TextInput, TextInputChangeEvent } from '../primitives';

export type IDbHeaderProps = {
  db?: t.ITestRendererDb;
  style?: GlamorValue;
};

export class DbHeader extends React.PureComponent<IDbHeaderProps> {
  constructor(props: IDbHeaderProps) {
    super(props);
  }

  public render() {
    const { db } = this.props;
    if (!db) {
      return null;
    }

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
      }),
      textbox: css({
        // borderBottom: `solid 1px ${color.format(-0.1)}`,
      }),
      keyOuter: css({
        fontFamily: 'monospace',
        fontSize: 11,
        fontWeight: 'bold',
        color: color.format(-0.2),
        marginTop: 3,
        marginLeft: 4,
      }),
      key: css({
        color: COLORS.CLI.CYAN,
      }),
    };
    const elPublicKey = <span {...styles.key}>{db.key}</span>;
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
          <div {...styles.keyOuter}>public-key:{elPublicKey} (primary)</div>
        </div>
      </div>
    );
  }

  private handleChange = (e: TextInputChangeEvent) => {
    console.log('e', e);
  };
}
