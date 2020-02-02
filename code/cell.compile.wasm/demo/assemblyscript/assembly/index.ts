// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}

/**
 * TEMP
 */

// declare type Foo = { msg: i32 };

declare function consoleLog(arg0: i32): void;
// declare function foo(obj: ): void;

export function tmp(a: i32[]): i32 {
  consoleLog(123456);
  return 123;
}
