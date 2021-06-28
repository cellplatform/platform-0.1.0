import { ElectronEnv, ElectronEnvKey } from './types';

const isWindow = typeof window !== 'undefined';
const key: ElectronEnvKey = 'cell.runtime.electron';
export const env = isWindow ? ((window as any)[key] as ElectronEnv) : undefined;
