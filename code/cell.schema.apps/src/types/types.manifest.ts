/**
 * The defining manifest of an application bundle.
 * Stored within an [app.json] file.
 */
export type IAppManifestFile = {
  name: string;
  entry: string;
  devPort: number;
  window: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
  };
};
