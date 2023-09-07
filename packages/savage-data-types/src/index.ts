/**
 * @packageDocumentation
 * 
 * A library for determining the type of JavaScript variables. It is simple, convenient, and can be used out of the box. It provides many methods for use.
 * 
 * ## installtion

::: code-group

```[npm]
npm i savage-data-types
```

```[pnpm]
pnpm add savage-data-types
```

```[yarn]
yarn add savage-data-types
```
:::


## how to use

```typescript
import { dataTypes } from "@savage181855/data-types";

console.log(dataTypes.isUndefined(undefined));

console.log(dataTypes.isNull(null));

console.log(dataTypes.isString(""));

console.log(dataTypes.isNumber("1"));

console.log(dataTypes.isString(""));

console.log(dataTypes.isString(""));

console.log(dataTypes.isArray([]));

console.log(dataTypes.isObject({}));

console.log(dataTypes.isMap(new Map()));
```

## all of api for `dataTypes`
- isString
- isNumber
- isBoolean
- isArray
- isNull
- isArrayBuffer
- isBigInt
- isBigInt64Array
- isBigUint64Array
- isDataView
- isDate
- isError
- isEvalError
- isFloat32Array
- isFloat64Array
- isFunction
- isGenerator
- isInt16Array
- isInt32Array
- isMap
- isInt8Array
- isObject
- isPromise
- isRegExp
- isSet
- isSymbol
- isSyntaxError
- isTypeError
- isUint16Array
- isUint32Array
- isUint8Array
- isUint8ClampedArray
- isURIError
- isWeakMap
- isWeakRef
- isUndefined
- isArguments

 */

export * from './dataTypes'
