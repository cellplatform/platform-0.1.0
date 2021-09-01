import { CodeEditor, CodeEditorProps } from '../../components/CodeEditor';

import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SampleProps = {
  bus: t.EventBus<any>;
  style?: CssValue;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { bus } = props;
  const styles = { base: css({}) };

  const id = 'foo';
  const filename = 'foo.txt';

  return (
    <div {...css(styles.base, props.style)}>
      <CodeEditor bus={bus} id={id} filename={filename} />
    </div>
  );
};
