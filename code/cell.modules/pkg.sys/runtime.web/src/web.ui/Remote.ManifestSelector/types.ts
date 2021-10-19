import * as t from '../../common/types';

type Url = string;

/**
 * Event handler for when a Manifest "remote entry" is clicked.
 */
export type RemoteEntryClickHandler = (e: RemoteEntryClickArgs) => void;
export type RemoteEntryClickArgs = { manifest: Url; remote: t.ModuleManifestRemoteImport };

/**
 * Event handler for when a manifest URL changes
 * (eg, via a textbox keypress).
 */
export type ManifestUrlChangeHandler = (e: ManifestUrlChangeArgs) => void;
export type ManifestUrlChangeArgs = { url: Url };

/**
 * Event handler for an action that requests a [Module Manifest] is loaded.
 */
export type LoadManifestHandler = (e: LoadManifestArgs) => void;
export type LoadManifestArgs = { url: Url };
