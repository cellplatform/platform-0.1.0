import { t } from '../common';

export function createBody(req: t.IncomingMessage, parser: t.BodyParser): t.IRouteRequestBody {
  return {
    async json<T>(options: t.IParseBodyJsonOptions<T> = {}) {
      return parser.json(req, { ...options });
    },
    async buffer(options: t.IParseBodyBufferOptions = {}) {
      return parser.buffer(req, { ...options });
    },
    async form(options: t.IParseBodyFormOptions = {}) {
      return parser.form(req, { ...options });
    },
  };
}
