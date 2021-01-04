export * from '@platform/cell.types/lib/types.Runtime';

export type AllowedStdlib = NodeStdlib | '*';

export type NodeStdlib =
  | 'fs'
  | 'os'
  | 'tty'
  | 'url'
  | 'path'
  | 'crypto'
  | 'http'
  | 'http2'
  | 'events'
  | 'net'
  | 'domain'
  | 'dns'
  | 'cluster'
  | 'child_process'
  | 'buffer'
  | 'async_hooks'
  | 'assert'
  | 'util';
