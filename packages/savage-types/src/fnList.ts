/* eslint-disable */
export function isAggregateError(value: unknown): value is AggregateError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'AggregateError'
}
export function isArray(value: unknown): value is Array<unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Array'
}
export function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return Object.prototype.toString.call(value).slice(8, -1) === 'ArrayBuffer'
}

export function isAsyncGenerator(value: unknown): value is AsyncGenerator {
  return Object.prototype.toString.call(value).slice(8, -1) === 'AsyncGenerator'
}
export function isAsyncGeneratorFunction(value: unknown): value is AsyncGeneratorFunction {
  return Object.prototype.toString.call(value).slice(8, -1) === 'AsyncGeneratorFunction'
}
export function isAsyncIterator(value: unknown): value is AsyncIterator<unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'AsyncIterator'
}
export function isAtomics(value: unknown): value is Atomics {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Atomics'
}
export function isBigInt(value: unknown): value is BigInt {
  return Object.prototype.toString.call(value).slice(8, -1) === 'BigInt'
}
export function isBigInt64Array(value: unknown): value is BigInt64Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'BigInt64Array'
}
export function isBigUint64Array(value: unknown): value is BigUint64Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'BigUint64Array'
}
export function isBoolean(value: unknown): value is Boolean {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Boolean'
}
export function isDataView(value: unknown): value is DataView {
  return Object.prototype.toString.call(value).slice(8, -1) === 'DataView'
}
export function isDate(value: unknown): value is Date {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Date'
}
export function isError(value: unknown): value is Error {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Error'
}
export function isEvalError(value: unknown): value is EvalError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'EvalError'
}
export function isFinalizationRegistry(value: unknown): value is FinalizationRegistry<unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'FinalizationRegistry'
}
export function isFloat32Array(value: unknown): value is Float32Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Float32Array'
}
export function isFloat64Array(value: unknown): value is Float64Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Float64Array'
}
export function isFunction(value: unknown): value is Function {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Function'
}
export function isGenerator(value: unknown): value is Generator {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Generator'
}
export function isGeneratorFunction(value: unknown): value is GeneratorFunction {
  return Object.prototype.toString.call(value).slice(8, -1) === 'GeneratorFunction'
}


export function isInt16Array(value: unknown): value is Int16Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Int16Array'
}
export function isInt32Array(value: unknown): value is Int32Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Int32Array'
}
export function isInt8Array(value: unknown): value is Int8Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Int8Array'
}


export function isIterator(value: unknown): value is Iterator<unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Iterator'
}
export function isJSON(value: unknown): value is JSON {
  return Object.prototype.toString.call(value).slice(8, -1) === 'JSON'
}
export function isMap(value: unknown): value is Map<unknown,unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Map'
}
export function isMath(value: unknown): value is Math {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Math'
}

export function isNumber(value: unknown): value is Number {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Number'
}
export function isObject(value: unknown): value is Object {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Object'
}
export function isPromise(value: unknown): value is Promise<unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Promise'
}

export function isRangeError(value: unknown): value is RangeError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'RangeError'
}
export function isReferenceError(value: unknown): value is ReferenceError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'ReferenceError'
}

export function isRegExp(value: unknown): value is RegExp {
  return Object.prototype.toString.call(value).slice(8, -1) === 'RegExp'
}
export function isSet(value: unknown): value is Set<unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Set'
}
export function isSharedArrayBuffer(value: unknown): value is SharedArrayBuffer {
  return Object.prototype.toString.call(value).slice(8, -1) === 'SharedArrayBuffer'
}
export function isString(value: unknown): value is String {
  return Object.prototype.toString.call(value).slice(8, -1) === 'String'
}
export function isSymbol(value: unknown): value is Symbol {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Symbol'
}
export function isSyntaxError(value: unknown): value is SyntaxError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'SyntaxError'
}
export function isTypedArray(value: unknown): value is TypedArray {
  return Object.prototype.toString.call(value).slice(8, -1) === 'TypedArray'
}
export function isTypeError(value: unknown): value is TypeError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'TypeError'
}
export function isUint16Array(value: unknown): value is Uint16Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Uint16Array'
}
export function isUint32Array(value: unknown): value is Uint32Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Uint32Array'
}
export function isUint8Array(value: unknown): value is Uint8Array {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Uint8Array'
}
export function isUint8ClampedArray(value: unknown): value is Uint8ClampedArray {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Uint8ClampedArray'
}
export function isUndefined(value: unknown): value is undefined {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Undefined'
}
export function isURIError(value: unknown): value is URIError {
  return Object.prototype.toString.call(value).slice(8, -1) === 'URIError'
}
export function isWeakMap(value: unknown): value is WeakMap<object,unknown> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'WeakMap'
}
export function isWeakRef(value: unknown): value is WeakRef<object> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'WeakRef'
}
export function isWeakSet(value: unknown): value is WeakSet<object> {
  return Object.prototype.toString.call(value).slice(8, -1) === 'WeakSet'
}
export function isNull(value: unknown): value is null {
  return Object.prototype.toString.call(value).slice(8, -1) === 'Null'
}
