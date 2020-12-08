import { t } from '../common';

type J = t.Json;

export type RuntimeIn<T extends J = J> = { value?: T; info: RuntimePipeInfo };
export type RuntimeOut<T extends J = J> = { value?: T; info: RuntimePipeInfo };

export type RuntimePipeInfo = {
  headers?: RuntimePipeInfoHeaders;
};

export type RuntimePipeInfoHeaders = {
  contentType?: string; // Mimetype.
  contentTypeDef?: string; // URL to type-def of {value}.
};
