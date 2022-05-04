import React, { useEffect, useState } from 'react';

import { css, CssValue, ObjectView, t } from '../common';

export type JsonViewProps = {
  text?: string;
  style?: CssValue;
};

export const JsonView: React.FC<JsonViewProps> = (props) => {
  const [json, setJson] = useState<t.Json | undefined>();

  /**
   * Lifecycle
   */

  useEffect(() => {
    const text = props.text;
    let json: t.Json | undefined = undefined;

    if (typeof text === 'string') {
      try {
        json = JSON.parse(text);
      } catch (error: any) {
        console.log('Failed to parse JSON', error);
      }
    }

    setJson(json);
  }, [props.text]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      boxSizing: 'border-box',
      Padding: [20, 30],
      Scroll: true,
    }),
  };
  return <div {...css(styles.base, props.style)}>{json && <ObjectView data={json} />}</div>;
};
