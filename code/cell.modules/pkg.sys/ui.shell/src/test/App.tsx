import React from 'react';

import { Shell, ShellWindow } from '..';
import { bundle, CssValue, log, t } from '../common';
import { TmplModule } from './module.Sample';
import * as tt from './module.Sample/types';

type T = t.ITreeNode<tt.TmplProps>;

log.info('bundle', bundle);

export type AppProps = { style?: CssValue };

export const App: React.FC<AppProps> = (props: AppProps = {}) => {
  const onLoaded = (bus: t.EventBus) => {
    console.log('Loaded:', `<Shell.Window>`);

    const shell = Shell.builder(bus);
    const m1 = TmplModule.module(bus);
    const m2 = TmplModule.module(bus);
    // const m3 = TmplModule.module(bus);

    moduleUrl(m1, 'https://tdb.sfo2.digitaloceanspaces.com/tmp/thought-vectors.06.png');
    moduleUrl(m2, 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png');
    // moduleUrl(m3, 'https://tdb.sfo2.digitaloceanspaces.com/tmp/homo-economicus.png');

    shell.name('hello world!');
    shell.add(m1).label('consulting');
    shell.add(m2).label('leaf');

    const urls = [
      'https://tdb.sfo2.digitaloceanspaces.com/tmp/consulting/homo-economicus.png',
      'https://tdb.sfo2.digitaloceanspaces.com/tmp/consulting/innovation-infrastructure.png',
      'https://tdb.sfo2.digitaloceanspaces.com/tmp/consulting/simplicity-far-side.png',
      'https://tdb.sfo2.digitaloceanspaces.com/tmp/consulting/what-happens.png',
    ];

    urls.forEach((url, i) => {
      const m = TmplModule.module(bus);
      shell.add(m, m1).label(`Diagram ${i + 1}`);
      moduleUrl(m, url);
    });
  };

  return <ShellWindow theme={'WHITE'} onLoaded={onLoaded} acceptNakedRegistrations={true} />;
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
