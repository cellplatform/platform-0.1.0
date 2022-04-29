import React, { useEffect, useRef, useState } from 'react';

import { Antechamber, css, FC, t, R } from '../common';
import { State } from '../logic';
import { Login } from './Auth.Login';

/**
 * Auth (Antechamber)
 */

export type AuthProps = {
  instance: t.AppInstance;
  state: t.AppState;
};

const View: React.FC<AuthProps> = (props) => {
  const { state } = props;

  /**
   * [Render]
   */
  const styles = {
    login: css({ marginTop: 40 }),
  };

  const elLogin = <Login instance={props.instance} state={state} style={styles.login} />;
  return <Antechamber style={{ Absolute: 0 }} isOpen={state.auth.isOpen} centerBottom={elLogin} />;
};

/**
 * Export
 */
export const Auth = React.memo(View, (prev, next) => {
  if (prev.instance.id !== next.instance.id) return false;
  if (!R.equals(prev, next)) return false;
  return true;
});
