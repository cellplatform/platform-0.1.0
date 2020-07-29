import * as React from 'react';
import { t } from '../common';
import { Windows } from './Windows';
import { InstallerDialog } from './Installer';

export const renderOverlay: t.RenderOverlay = (e: t.IAppStateOverlay) => {
  switch (e.kind) {
    case 'WINDOWS':
      return <Windows uri={e.uri} />;
    case 'INSTALL':
      return <InstallerDialog dir={e.dir} files={e.files} urls={e.urls} />;
    default:
      return null;
  }
};
