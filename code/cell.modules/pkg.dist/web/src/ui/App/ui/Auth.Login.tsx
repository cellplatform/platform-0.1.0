import React from 'react';
import { color, css, CssValue, t, Text } from '../common';
import { State } from '../logic';

/**
 * Login Component.
 */
export type LoginProps = {
  instance: t.AppInstance;
  state: t.AppState;
  style?: CssValue;
};

export const Login: React.FC<LoginProps> = (props) => {
  const { state } = props;
  const events = State.useEvents(props.instance);

  /**
   * [Render]
   */
  const styles = {
    base: css({ minWidth: 300, boxSizing: 'border-box' }),
    textbox: {
      outer: css({
        backgroundColor: color.format(1),
        padding: 6,
        Flex: 'horizontal-stretch-stretch',
        border: `solid 1px ${color.format(-0.3)}`,
        borderRadius: 6,
      }),
      input: css({ flex: 1 }),
    },
  };

  const elInput = (
    <div {...styles.textbox.outer}>
      <Text.Input
        value={state.auth.token}
        style={styles.textbox.input}
        placeholder={'access token'}
        placeholderStyle={{ italic: true, opacity: 0.3 }}
        spellCheck={false}
        autoCapitalize={false}
        autoComplete={false}
        autoCorrect={false}
        maxLength={64}
        focusOnLoad={true}
        onChange={(e) => events.state.patch((state) => (state.auth.token = e.to))}
        onEnter={() => events.login()}
      />
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elInput}</div>;
};
