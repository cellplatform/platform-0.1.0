import * as t from '../../common/types';

type Url = string;
type InstanceId = string;

/**
 * Event handler for when a Manifest "remote entry" is clicked.
 */
export type ManifestSelectorEntryClickHandler = (e: ManifestSelectorEntryClickArgs) => void;
export type ManifestSelectorEntryClickArgs = {
  manifest: Url;
  remote: t.ModuleManifestRemoteImport;
};

/**
 * Event handler for when a manifest URL changes
 * (eg, via a textbox keypress).
 */
export type ManifestSelectorUrlChangeHandler = (e: ManifestSelectorUrlChangeArgs) => void;
export type ManifestSelectorUrlChangeArgs = { url: Url };

/**
 * Event handler for an action that requests a [Module Manifest] is loaded.
 */
export type ManifestSelectorLoadHandler = (e: ManifestSelectorLoadArgs) => void;
export type ManifestSelectorLoadArgs = { url: Url };

/**
 * Event handler of when the loaded manifest changes.
 */
export type ManifestSelectorChangedHandler = (e: ManifestSelectorChangedArgs) => void;
export type ManifestSelectorChangedArgs = { url?: string; manifest?: t.ModuleManifest };

/**
 * [Events]
 */
export type ManifestSelectorEvent = ManifestSelectorActionEvent | ManifestSelectorCurrentEvent;

/**
 * Key actions emitted from selector.
 */
export type ManifestSelectorActionEvent = {
  type: 'sys.runtime.web/ManifestSelector/action';
  payload: ManifestSelectorAction;
};
export type ManifestSelectorAction = {
  kind: 'loadManifest' | 'loadEntry';
  manifest: Url;
  component: InstanceId;
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
  url: Url;
  manifest?: t.ModuleManifest;
};
