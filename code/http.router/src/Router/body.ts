import { t } from '../common';

export function createBody(req: t.IncomingMessage, parser: t.BodyParser): t.RequestBody {
  return {
    async json<T>(options: t.ParseBodyJsonOptions<T> = {}) {
      return parser.json(req, { ...options });
    },
    async buffer(options: t.ParseBodyBufferOptions = {}) {
      return parser.buffer(req, { ...options });
    },
    async form(options: t.ParseBodyFormOptions = {}) {
      return parser.form(req, { ...options });
    },
  };
}
