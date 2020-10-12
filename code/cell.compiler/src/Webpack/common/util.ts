export const escapeKeyPath = (key: string) => key.replace(/\//g, '\\');
export const escapeKeyPaths = (obj: Record<string, any>) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[escapeKeyPath(key)] = obj[key];
    return acc;
  }, {});
};

export const unescapeKeyPath = (key: string) => key.replace(/\\/g, '/');
export const unescapeKeyPaths = (obj: Record<string, any>) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[unescapeKeyPath(key)] = obj[key];
    return acc;
  }, {});
};



