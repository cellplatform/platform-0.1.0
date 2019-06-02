import { create } from './http';
export { create };

const http = create();
export const get = http.get;
