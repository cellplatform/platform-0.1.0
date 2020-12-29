import { t } from '../common';

export type CreateAndSave = (args: CreateAndSaveArgs) => Promise<CreateAndSaveResponse>;
export type CreateAndSaveResponse = { path: string; manifest: t.TypeManifest };
export type CreateAndSaveArgs = {
  base: string;
  dir: string;
  filename?: string; // Default: "index.json"
  model?: t.CompilerModel;
  copyRefs?: boolean;
};
