import { t } from '../common';

export const bodyParser: t.BodyParser = {
  async json<T>(req: t.IncomingMessage, options?: t.ParseBodyJsonOptions<T>) {
    return {} as any; // Stub
  },

  async form(req: t.IncomingMessage, options?: t.ParseBodyFormOptions) {
    return {} as any; // Stub
  },

  async buffer(req: t.IncomingMessage, options?: t.ParseBodyBufferOptions) {
    return {} as any; // Stub
  },
};
