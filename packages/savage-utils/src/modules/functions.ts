// a[3].b -> a.3.b -> [a, 3, b]
/** lodash get方法 */
/**
 * @example
 *
 * ```ts
 * const object = { a: [{ b: { c: 3 } }] }
 * console.log(get(object, 'a[0].b.c')) // 3
 * ```
 */
export function get(data: object, path: string) {
  const paths = path
    .replace(/\[(\w+)\]/g, '.$1')
    .replace(/\["(\w+)"\]/g, '.$1')
    .replace(/\['(\w+)'\]/g, '.$1')
    .split('.')

  return paths.reduce((x, y) => x?.[y as keyof object], data)
}

/** 单例模式 */
export function getSingle<T = unknown>(fn: () => T) {
  let res: T

  return function (this: unknown, ...args: unknown[]) {
    return res || (res = fn.apply(this, args as []))
  }
}

export function sleep(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })
}

export async function queueExcution(list: (() => Promise<void>)[]) {
  for (const fn of list) {
    await fn()
  }
}

export function capitalize(text: string) {
  return text
    .split('')
    .map((v, i) => (i === 0 ? v.toUpperCase() : v))
    .join('')
}

export function unCapitalize(text: string) {
  return text
    .split('')
    .map((v, i) => (i === 0 ? v.toLocaleLowerCase() : v))
    .join('')
}

export function hyphenToCamelCase(text: string, isCapitalize = false) {
  const handledText = text
    .split('-')
    .map((v) => capitalize(v))
    .join('')

  return isCapitalize ? capitalize(handledText) : unCapitalize(handledText)
}

export function camelCaseToHyphen(text: string) {
  return text.replace(/[A-Z]/g, (match) => `-${match.toLocaleLowerCase()}`)
}

export function normalizePath(path: string) {
  return path.replaceAll('\\', '/')
}
