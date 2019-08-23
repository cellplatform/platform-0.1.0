export * from '../common/types';
import { Manifest } from '../manifest';

export type GetManifest = (args?: { force?: boolean }) => Promise<Manifest>;
