export const clean = (path: string) => (path || '').trim();
export const cleanPath = (path: string) => clean(path).replace(/^\/*/, '');
export const cleanDir = (path: string) => clean(path).replace(/\/*$/, '');
export const toCachePath = (dir: string, path: string) => `${cleanDir(dir)}/${cleanPath(path)}`;
