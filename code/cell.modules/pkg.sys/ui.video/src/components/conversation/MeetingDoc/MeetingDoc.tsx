import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t } from '../common';

export type MeetingDocProps = { style?: CssValue };

export const MeetingDoc: React.FC<MeetingDocProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      Flex: 'center-center',
    }),
  };
  return <div {...css(styles.base, props.style)}>MeetingDoc</div>;
};
