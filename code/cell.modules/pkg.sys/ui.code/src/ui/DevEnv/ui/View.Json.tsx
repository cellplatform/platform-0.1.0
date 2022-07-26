import React, { useEffect, useState } from 'react';
import { Color, css, CssValue, ObjectView, t, log } from '../common';

export type JsonViewProps = {
  text?: string;
  style?: CssValue;
};

export const JsonView: React.FC<JsonViewProps> = (props) => {
  const [json, setJson] = useState<t.Json | undefined>();
  const [error, setError] = useState<Error | undefined>();

  /**
   * Lifecycle
   */

  useEffect(() => {
    const text = props.text;
    let json: t.Json | undefined = undefined;

    if (typeof text === 'string' && text) {
      try {
        json = JSON.parse(text);
        setError(undefined);
      } catch (error: any) {
        log.error('Caught error (not thrown).\nFailed to parse JSON', error);
        setError(error);
      }
    }

    setJson(json);
  }, [props.text]);

  const BORDER_HR = `solid 5px ${Color.format(-0.1)}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      boxSizing: 'border-box',
      Padding: [20, 30],
      Scroll: true,
      Flex: 'y-stretch-stretch',
    }),
    title: css({
      paddingBottom: 12,
      marginBottom: 15,
      borderBottom: BORDER_HR,
    }),
    body: css({
      flex: 1,
    }),
    footer: css({
      borderTop: BORDER_HR,
      paddingTop: 12,
    }),
  };

  const elJson = json && <ObjectView data={json} />;
  const elFooter = error && <div>{error.message}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.title}>JSON</div>
      <div {...styles.body}>{elJson}</div>
      <div {...styles.footer}>{elFooter}</div>
    </div>
  );
};
