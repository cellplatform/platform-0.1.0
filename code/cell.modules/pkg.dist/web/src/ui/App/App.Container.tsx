import React, { useEffect, useState } from 'react';

import { App } from './App';
import { CssValue, DEFAULT, t } from './common';

export type AppContainerProps = {
  instance: t.AppInstance;
  style?: CssValue;
};

export const AppContainer: React.FC<AppContainerProps> = (props) => {
  const { instance } = props;

  const [state, setState] = useState<t.AppState>(DEFAULT.STATE);

  /**
   * Lifecycle
   */
  useEffect(() => {
    const events = App.Controller({ instance });
    events.state.$.subscribe((e) => setState(e.value));
    setState(events.state.current);

    return () => events.dispose();
  }, [instance.id]); // eslint-disable-line

  /**
   * [Render]
   */
  return <App instance={instance} state={state} style={props.style} />;
};
