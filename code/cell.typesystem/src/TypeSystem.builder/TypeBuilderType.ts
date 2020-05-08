import { coord, defaultValue, t, Uri } from '../common';
import { TypeScript, TypeValue } from '../TypeSystem.core';
import { OnPropChangeEventHandler, TypeBuilderProp } from './TypeBuilderProp';

export type IArgs = {
  uri: string | t.INsUri;
  typename: string;
  startColumn?: string | number;
};

/**
 * A structured API for building a type-definitions of a single namespace.
 */
export class TypeBuilderType implements t.ITypeBuilderType {
  public static create = (args: IArgs) => new TypeBuilderType(args) as t.ITypeBuilderType;

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    const validation = TypeScript.validate.objectTypename(args.typename);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let startColumn = defaultValue(args.startColumn, 0);
    if (typeof startColumn === 'string') {
      if (!coord.cell.isColumn(startColumn)) {
        throw new Error(`The given start-column key (${startColumn}) is not a valid column`);
      }
      startColumn = coord.cell.toAxisIndex('COLUMN', startColumn);
    }
    if (typeof startColumn === 'number' && startColumn < 0) {
      throw new Error(`The given start-column index (${startColumn}) is less than zero`);
    }

    this.uri = Uri.ns(args.uri);
    this.typename = (args.typename || '').trim();
    this.startColumn = startColumn as number;
  }

  /**
   * [Fields]
   */
  public readonly uri: t.INsUri;
  public readonly typename: string;

  // Internal.
  public readonly startColumn: number;
  private _lastColumn: number;
  private _props: t.ITypeBuilderProp[] = [];

  /**
   * [Properties]
   */
  public get props() {
    return this._props;
  }

  /**
   * [Methods]
   */
  public toString() {
    return this.uri.toString();
  }

  public toObject() {
    return { columns: {} };
  }

  public prop(
    name: string,
    arg?: t.CellType | t.ITypeBuilderPropOptions | ((builder: t.ITypeBuilderProp) => void),
  ) {
    name = (name || '').trim();
    const validName = TypeScript.validate.propname(name);
    if (validName.error) {
      throw new Error(validName.error);
    }

    const exists = this.props.some(prop => prop.toObject().name === name);
    if (exists) {
      const err = `A property named '${name}' has already been added`;
      throw new Error(err);
    }

    const onChange = this.onPropChange;

    const column = this.nextColumn(typeof arg === 'object' ? arg.column : undefined);
    const toBuilder = (arg?: t.CellType | t.ITypeBuilderPropOptions) => {
      const options = typeof arg === 'string' || arg === undefined ? { type: arg } : arg;
      return TypeBuilderProp.create({ ...options, column, name, onChange });
    };

    const builder =
      typeof arg === 'function'
        ? TypeBuilderProp.create({ column, name, onChange })
        : toBuilder(arg);
    if (typeof arg === 'function') {
      arg(builder);
    }

    this._props.push(builder);
    return this;
  }

  /**
   * [Helpers]
   */
  private nextColumn(input?: string | number) {
    let column = -1;

    if (input !== undefined) {
      column = typeof input === 'string' ? coord.cell.toAxisIndex('COLUMN', input) : input;
    } else {
      if (this._lastColumn === undefined) {
        column = this.startColumn;
      } else {
        column = this._lastColumn + 1;
      }
    }

    if (this._lastColumn === undefined || column > this._lastColumn) {
      this._lastColumn = column;
    }

    return column;
  }

  private onPropChange: OnPropChangeEventHandler = e => {
    if (e.prop === 'column') {
      this.onColumnChange(e.value);
    }
  };

  private onColumnChange(key: string) {
    const index = coord.cell.toAxisIndex('COLUMN', key);
    if (this._lastColumn === undefined || index > this._lastColumn) {
      this._lastColumn = index;
    }
  }
}
