type Url = string;

export type RemoteEntryClickHandler = (e: RemoteEntryClickArgs) => void;
export type RemoteEntryClickArgs = { manifest: Url; remote: RemoteEntry };
export type RemoteEntry = { url: Url; namespace: string; entry: string };

export type ManifestUrlChangeHandler = (e: ManifestUrlChangeArgs) => void;
export type ManifestUrlChangeArgs = { url: Url };

export type LoadManifestHandler = (e: LoadManifestArgs) => void;
export type LoadManifestArgs = { url: Url };
