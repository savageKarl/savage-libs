import { isObject, isArray } from 'savage-types'

/**
 * 迭代器模式：内部迭代器，由函数内部控制自动进行迭代
 */
export function each<T extends object>(
  obj: T,
  fn: (v: T[keyof T], i: keyof T, obj: T) => unknown
) {
  if (isObject(obj) || isArray(obj)) {
    for (const k in obj) {
      const res = fn(obj[k], k, obj)
      if (res === false) break
    }
  }
}

/**
 * 迭代器模式：外部迭代器，由外部控制进行迭代
 */
export class Iterator<T extends unknown[]> {
  private current = 0
  public length: number

  constructor(private obj: T) {
    this.length = obj.length
  }

  isDone() {
    return this.current + 1 >= this.length
  }

  next() {
    this.current += 1
  }

  getCurrentItem() {
    return this.obj[this.current]
  }
}
