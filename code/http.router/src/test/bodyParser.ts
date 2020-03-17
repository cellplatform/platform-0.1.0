import { t } from '../common';

export const bodyParser: t.BodyParser = {
  async json<T>(req: t.IncomingMessage, options?: t.IParseBodyJsonOptions<T>) {
    return {} as any; // Stub
  },

  async form(req: t.IncomingMessage, options?: t.IParseBodyFormOptions) {
    return {} as any; // Stub
  },

  async buffer(req: t.IncomingMessage, options?: t.IParseBodyBufferOptions) {
    return {} as any; // Stub
  },
};
