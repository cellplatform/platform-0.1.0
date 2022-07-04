import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  Sample__0_0_0: import('./ui/DEV.Sample-0.0.0/dev/DEV'),
  SampleDeploy: import('./ui/DEV.Sample.Deploy/DEV'),

  Design: import('./ui/Design/DEV'),
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  DocLayoutContainer: import('./ui/Doc.LayoutContainer/dev/DEV'),
  DocLayout: import('./ui/Doc.Layout/dev/DEV'),
  DocList: import('./ui/Doc.List/dev/DEV'),
  DocIndex: import('./ui/Doc.Index/dev/DEV'),
  DocHeadline: import('./ui/Doc.Headline/dev/DEV'),
  DocByline: import('./ui/Doc.Byline/dev/DEV'),
  DocBlock: import('./ui/Doc.Block/dev/DEV'),
  DocImage: import('./ui/Doc.Image/dev/DEV'),
  DocQuote: import('./ui/Doc.Quote/dev/DEV'),

  TalkingDiagram: import('./ui/Diagram.TalkingDiagram/dev/DEV'),

  RouteBus: import('./ui/Route.Bus/dev/DEV'),
  RouteView: import('./ui/Route.View/dev/DEV'),

  RouteContainer___: import('./ui/RouteContainer.OLD/dev/DEV'),

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
