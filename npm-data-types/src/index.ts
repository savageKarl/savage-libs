/**
 * @packageDocumentation
 * 
 * 一个用于判断`javascript`变量类型的库，简单，便捷，开箱即用，提供了很多方法用于使用。
 * 
 * ## 安装

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


# 使用说明

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

## 所有 api
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
