import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  Design: import('./ui/Design/DEV'),
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  RouteContainer: import('./ui/RouteContainer/dev/DEV'),
  DocIndex: import('./ui/Doc.Index/dev/DEV'),
  DocLayout: import('./ui/Doc.Layout/dev/DEV'),
  DocHeadline: import('./ui/Doc.Headline/dev/DEV'),
  DocByline: import('./ui/Doc.Byline/dev/DEV'),
  DocBlock: import('./ui/Doc.Block/dev/DEV'),
  DocImage: import('./ui/Doc.Image/dev/DEV'),
  DocQuote: import('./ui/Doc.Quote/dev/DEV'),

  SampleDeploy: import('./ui/DEV.Sample.Deploy/DEV'),

  UnitTests: import('./Dev.UnitTests'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
