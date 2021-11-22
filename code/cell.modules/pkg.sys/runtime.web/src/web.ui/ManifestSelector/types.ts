import * as t from '../../common/types';

type InstanceId = string;
type UTCTimeStamp = number;

/**
 * Event handler for when a Manifest "remote entry" is clicked.
 */
export type ManifestSelectorExportClickHandler = (e: ManifestSelectorExportClickArgs) => void;
export type ManifestSelectorExportClickArgs = {
  url: t.ManifestUrl;
  module: t.ModuleManifestRemoteImport;
};

/**
 * Event handler for when a manifest URL changes
 * (eg, via a textbox keypress).
 */
export type ManifestSelectorUrlChangeHandler = (e: ManifestSelectorUrlChangeArgs) => void;
export type ManifestSelectorUrlChangeArgs = { url: t.ManifestUrl };

/**
 * Event handler for an action that requests a [Module Manifest] is loaded.
 */
export type ManifestSelectorLoadHandler = (e: ManifestSelectorLoadArgs) => void;
export type ManifestSelectorLoadArgs = { url: t.ManifestUrl };

/**
 * Event handler of when the loaded manifest changes.
 */
export type ManifestSelectorChangedHandler = (e: ManifestSelectorChangedArgs) => void;
export type ManifestSelectorChangedArgs = { url?: string; manifest?: t.ModuleManifest };

/**
 * Event handler for keydown event.
 */
export type ManifestSelectorKeyboardHandler = (e: ManifestSelectorKeyboardArgs) => void;
export type ManifestSelectorKeyboardArgs = {
  action: 'down' | 'up';
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  cancel(): void;
};

/**
 * Textbox load history
 */
export type ManifestSelectoryHistory = { url: string; time: UTCTimeStamp };

/**
 * [Events]
 */
export type ManifestSelectorEvent =
  | ManifestSelectorActionEvent
  | ManifestSelectorCurrentEvent
  | ManifestSelectorLoadedEvent
  | ManifestSelectorKeypressEvent;

/**
 * Key actions emitted from selector.
 */
export type ManifestSelectorActionEvent = {
  type: 'sys.runtime.web/ManifestSelector/action';
  payload: ManifestSelectorAction;
};
export type ManifestSelectorAction =
  | ManifestSelectorActionLoadManifest
  | ManifestSelectorActionLoadEntry
  | ManifestSelectorActionSetUrl;

export type ManifestSelectorActionLoadManifest = {
  kind: 'load:manifest';
  component: InstanceId;
  url: t.ManifestUrl;
};

export type ManifestSelectorActionLoadEntry = {
  kind: 'load:entry';
  component: InstanceId;
  url: t.ManifestUrl;
};

export type ManifestSelectorActionSetUrl = {
  kind: 'set:url';
  component: InstanceId;
  url: t.ManifestUrl;
};

/**
 * Broadcast current state.
 */
export type ManifestSelectorCurrentEvent = {
  type: 'sys.runtime.web/ManifestSelector/current';
  payload: ManifestSelectorCurrent;
};

export type ManifestSelectorCurrent = {
  component: InstanceId;
  url: t.ManifestUrl;
  manifest?: t.ModuleManifest;
};

/**
 * Fires when the manifest has been loaded.
 */
export type ManifestSelectorLoadedEvent = {
  type: 'sys.runtime.web/ManifestSelector/loaded';
  payload: ManifestSelectorLoaded;
};

export type ManifestSelectorLoaded = {
  component: InstanceId;
  url: t.ManifestUrl;
  manifest: t.ModuleManifest;
};

/**
 * Fires when the manifest has been loaded.
 */
export type ManifestSelectorKeypressEvent = {
  type: 'sys.runtime.web/ManifestSelector/keypress';
  payload: ManifestSelectorKeypress;
};

export type ManifestSelectorKeypress = {
  component: InstanceId;
  keypress: ManifestSelectorKeyboardArgs;
  current: { url: t.ManifestUrl };
};
