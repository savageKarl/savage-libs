export type Arg = string | number | bigint | boolean | symbol | object
export type Fun = (...args: Arg[]) => void
