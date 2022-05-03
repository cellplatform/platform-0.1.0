import React, { useState } from 'react';
import { color, css, CssValue, t } from '../../common';
// import { TextInput } from '../../../ui.ref/text/TextInput';
import { TextInput } from '../../Text.Input';

import { Antechamber, AntechamberProps } from '..';
import { PropList } from '../../PropList';

/**
 * Sample
 */
export type SampleProps = AntechamberProps;
export const Sample: React.FC<SampleProps> = (props) => {
  const styles = {
    base: css({
      position: 'relative',
      backgroundImage: `url(https://source.unsplash.com/ntqaFfrDdEA/1920x1280)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      display: 'flex',
    }),
    subject: css({ flex: 1 }),

    login: css({ marginTop: 40 }),

    props: css({ width: 300, marginBottom: 40 }),
  };

  const items: t.PropListItem[] = [
    { label: 'hello', value: '👋' },
    { label: 'message', value: 'foobar' },
    { label: 'number', value: 12345 },
  ];

  const elProps = (
    <div {...styles.props}>
      <PropList items={items} />
    </div>
  );

  const elLogin = (
    <div {...styles.login}>
      <Login />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <Antechamber {...props} style={styles.subject} centerTop={elProps} centerBottom={elLogin} />
    </div>
  );
};

/**
 * Login Component.
 */
export type LoginProps = { style?: CssValue };
export const Login: React.FC<LoginProps> = (props) => {
  const [value, setValue] = useState<string>('');

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
      <TextInput
        value={value}
        style={styles.textbox.input}
        spellCheck={false}
        autoCapitalize={false}
        autoComplete={false}
        autoCorrect={false}
        maxLength={64}
        onChange={(e) => setValue(e.to)}
        focusOnLoad={true}
      />
    </div>
  );

  return <div {...css(styles.base, props.style)}>{elInput}</div>;
};
