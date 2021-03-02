import React from 'react';
import { css, CssValue, t, color, copyToClipboard } from '../common';
import { Button } from '../../Primitives';

export type PeerLabelProps = {
  id: string;
  isSelf?: boolean;
  style?: CssValue;
};

export const PeerLabel: React.FC<PeerLabelProps> = (props) => {
  const { isSelf, id } = props;

  const styles = {
    base: css({
      Flex: 'horizontal-stretch-spaceBetween',
      fontSize: 11,
      userSelect: 'none',
    }),
    left: css({
      Flex: 'horizontal-stretch-center',
    }),
    right: css({}),
    title: css({
      backgroundColor: color.format(-0.1),
      border: `solid 1px ${color.format(-0.1)}`,
      borderRadius: 2,
      color: color.format(-0.5),
      fontWeight: 'bold',
      paddingTop: 3,
      paddingBottom: 2,
      PaddingX: 6,
      marginRight: 6,
      fontSize: 8,
    }),
    id: css({
      borderRadius: 3,
      userSelect: 'text',
    }),
  };

  const copy = (id: string) => {
    const url = `${location.origin}${location.pathname}?connectTo=${id}`;
    copyToClipboard(url);
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.left}>
        <div {...styles.title}>{isSelf ? 'ME' : 'PEER'}</div>
        <div {...styles.id} title={'Peer Identifier ("id")'}>
          {id}
        </div>
      </div>
      <div {...styles.right}>{id && <Button onClick={() => copy(id)}>copy</Button>}</div>
    </div>
  );
};
