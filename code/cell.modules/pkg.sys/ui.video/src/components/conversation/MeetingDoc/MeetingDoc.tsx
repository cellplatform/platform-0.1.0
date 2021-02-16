import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, bundle } from '../common';

export type MeetingDocProps = { style?: CssValue };

export const MeetingDoc: React.FC<MeetingDocProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }),
    body: css({
      Flex: 'center-center',
      Absolute: 0,
      paddingBottom: 20,
      PaddingX: 20,
    }),
    img: css({
      height: '100%',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <img src={bundle.path('/static/images/tmp.png')} {...styles.img} />
      </div>
    </div>
  );
};
