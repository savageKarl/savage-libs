# Savage-types

> A library for determining the type of JavaScript variables. It is simple, convenient, and can be used out of the box. It provides many methods for use.

## Feature

- out of box
- supports multiple APIs
- support typescript type guard

## How to use

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


See [here](https://savage181855.github.io/savage-libs/savage-types/)