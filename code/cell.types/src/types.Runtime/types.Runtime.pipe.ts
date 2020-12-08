import { t } from '../common';

type J = t.Json;

/**
 * Robustness principle:
 *
 *    "Be conservative in what you send, be liberal in what you accept"
 *     - Jon Postel (Postel's Law)
 *       https://en.wikipedia.org/wiki/Robustness_principle
 *
 */

export type RuntimeIn<T extends J = J> = { value?: T; info: RuntimePipeInfoIn };
export type RuntimeOut<T extends J = J> = { value?: T; info: RuntimeInfoOut };

export type RuntimePipeInfoIn = {
  headers?: Partial<RuntimeInfoHeaders>;
};

export type RuntimeInfoOut = {
  headers: RuntimeInfoHeaders;
};

export type RuntimeInfoHeaders = {
  contentType?: string; // Mimetype.
  contentTypeDef?: string; // URL to type-def of {value}.
};
