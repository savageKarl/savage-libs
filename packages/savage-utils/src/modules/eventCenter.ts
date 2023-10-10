// @ts-ignore
type CallBackFn = (arg: any) => unknown

interface SubscribeType {
	[index: string | symbol]: CallBackFn[]
}

/**
 * 发布订阅模型
 */
export class EventCenter {
	private subscribeList: SubscribeType = {}
	// 储存已发布未订阅的消息
	private pubAndNoSub: Record<string, unknown> = {}

	constructor(target: object = {}) {
		return Object.assign(this, target)
	}

	/**
	 * @param name - msg name of subscribe
	 * @param fn - callback
	 */
	subscribe(name: string, fn: CallBackFn) {
		if (this.pubAndNoSub[name]) {
			fn(this.pubAndNoSub[name])
			Reflect.deleteProperty(this.pubAndNoSub, name)
		}
		this.subscribeList[name]?.push(fn) || (this.subscribeList[name] = [fn])
	}

	publish(name: string, value: unknown) {
		const fns = this.subscribeList[name]
		if (!fns || fns.length === 0) {
			this.pubAndNoSub[name] = value
		} else {
			fns.forEach(fn => fn(value))
		}
	}

	remove(name: string, fn: CallBackFn) {
		const fns = this.subscribeList[name]

		if (!fns || fns.length === 0) return
		if (fn) {
			fns.forEach((_fn, index) => {
				if (_fn === fn) this.subscribeList[name].splice(index, 1)
			})
		} else {
			this.subscribeList[name] = []
		}
	}
}

export const eventCenter = new EventCenter()

/** 给对象添加发布订阅的事件中心 */
export function installEventCenter<T extends object>(target: T) {
	const evenCenter = new EventCenter(target)
	return evenCenter as EventCenter & typeof target
}
