import { ITemplateRequest, IVariables } from '../types';

/**
 * A request that is passed to a middleware processor.
 */
export class TemplateRequest implements ITemplateRequest {
  private readonly content: Buffer | string;
  public readonly path: ITemplateRequest['path'];
  public readonly variables: IVariables;

  constructor(args: {
    path: ITemplateRequest['path'];
    content: Buffer | string;
    variables: IVariables;
  }) {
    const { path, content, variables } = args;
    this.path = path;
    this.content = content;
    this.variables = variables;
  }

  /**
   * Reports whether the content is binary.
   */
  public get isBinary() {
    return typeof this.content !== 'string';
  }

  /**
   * The file content as a Buffer.
   */
  public get buffer() {
    return typeof this.content === 'string' ? Buffer.from(this.content) : this.content;
  }

  /**
   * The file content as text.
   */
  public get text() {
    return this.isBinary ? undefined : (this.content as string);
  }
}
