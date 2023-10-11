/**
 * @packageDocumentation
 * 
 * A library for determining the type of JavaScript variables. It is simple, convenient, and can be used out of the box. It provides many api for use.
 * 
 * ## installtion

::: code-group

```[npm]
npm i savage-types
```

```[pnpm]
pnpm add savage-types
```

```[yarn]
yarn add savage-types
```
:::


## how to use

```typescript
import { types } from 'savage-types'
import {
	isUndefined,
	isNull,
	isString,
	isArray,
	isObject,
	isMap
} from 'savage-types'

console.log(types.isUndefined(undefined))

console.log(types.isNull(null))

console.log(types.isString(''))

console.log(types.isNumber('1'))

console.log(types.isString(''))

console.log(types.isArray([]))

console.log(types.isObject({}))

console.log(types.isMap(new Map()))

console.log(isUndefined(undefined))

console.log(isNull(null))

console.log(isString(''))

console.log(isNumber('1'))

console.log(isString(''))

console.log(isArray([]))

console.log(isObject({}))

console.log(isMap(new Map()))

```

## all of api

- isAggregateError
- isArray
- isArrayBuffer
- isAsyncGenerator
- isAsyncGeneratorFunction
- isAsyncIterator
- isAtomics
- isBigInt
- isBigInt64Array
- isBigUint64Array
- isBoolean
- isDataView
- isDate
- isError
- isEvalError
- isFinalizationRegistry
- isFloat32Array
- isFloat64Array
- isFunction
- isGenerator
- isGeneratorFunction
- isInt16Array
- isInt32Array
- isInt8Array
- isIterator
- isJSON
- isMap
- isMath
- isNumber
- isObject
- isPromise
- isRangeError
- isReferenceError
- isRegExp
- isSet
- isSharedArrayBuffer
- isString
- isSymbol
- isSyntaxError
- isTypedArray
- isTypeError
- isUint16Array
- isUint32Array
- isUint8Array
- isUint8ClampedArray
- isUndefined
- isURIError
- isWeakMap
- isWeakRef
- isWeakSet
- isNull

*/

export * from './dataTypes'
