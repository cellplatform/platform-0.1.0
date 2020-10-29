import React from 'react';
import { css, CssValue, bundle, log, t, Module } from '../common';
import { Shell } from '../Shell';
import { TmplModule } from './module.Tmpl';

import * as tt from './module.Tmpl/types';

type T = t.ITreeNode<tt.TmplProps>;

log.info('bundle', bundle);

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props: AppProps = {}) => {
  const onLoaded = (bus: t.EventBus) => {
    console.log('Loaded:', `<Shell.Window>`);

    const shell = Shell.builder(bus);
    const m1 = TmplModule.module(bus);
    const m2 = TmplModule.module(bus);
    const m3 = TmplModule.module(bus);

    moduleUrl(m1, 'https://tdb.sfo2.digitaloceanspaces.com/tmp/thought-vectors.06.png');
    moduleUrl(m2, 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png');
    moduleUrl(m3, 'https://tdb.sfo2.digitaloceanspaces.com/tmp/homo-economicus.png');

    shell.name('hello world!');

    //
    shell.add(m1).label('foo');
    shell.add(m2).label('leaf');
    shell.add(m3).label('economicus');
  };

  return <Shell.Window theme={'WHITE'} onLoaded={onLoaded} acceptNakedRegistrations={true} />;
};

export default App;

/**
 * Helpoers
 */

const setUrl = (draft: T, url: string) => {
  const props = draft.props || (draft.props = {});
  const data = props.data || (props.data = {});
  data.url = url;
};

const moduleUrl = (m: tt.TmplModule, url: string) => {
  m.change((draft) => setUrl(draft, url));
};
