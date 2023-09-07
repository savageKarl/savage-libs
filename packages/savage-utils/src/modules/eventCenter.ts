interface SubscribeType {
	[index: string | symbol]: Array<(...args: any) => unknown>
}

/**
 * 发布订阅模型
 */
export class EventCenter {
	private subscribeList: SubscribeType = {}
	// 储存已发布未订阅的消息
	private pubAndNoSub: SubscribeType = {}

	/**
	 *
	 * @param name - msg name of subscribe
	 * @param fn - callback
	 */
	subscribe(name: string, fn: (...arg: any) => unknown) {
		if (this.pubAndNoSub[name]) {
			fn(this.pubAndNoSub[name])
			Reflect.deleteProperty(this.pubAndNoSub, name)
		}
		this.subscribeList[name]?.push(fn) || (this.subscribeList[name] = [fn])
	}

	publish(name: string, value: any) {
		const fns = this.subscribeList[name]
		if (!fns || fns.length === 0) {
			this.pubAndNoSub[name] = value
		} else {
			fns.forEach(fn => fn(value))
		}
	}

	remove(name: string, fn: (...args: any) => unknown) {
		const fns = this.subscribeList[name]
		if (!fns || fns.length === 0) return
		if (fn) {
			fns.forEach((_fn, index) => {
				if (_fn === fn) {
					this.subscribeList[name].splice(index, 1)
				}
			})
		} else {
			this.subscribeList[name] = []
		}
	}
}

/** 给对象添加发布订阅的事件中心 */
// export function installEventCenter(obj: Record<string, any>) {
// 	const res = Object.assign({}, new EventCenter(), obj)
// 	return res as EventCenter & typeof obj
// }

/** 给对象添加发布订阅的事件中心 */
// export function installEventCenter(obj: Record<string, any>) {
//   console.log(eventCenter)
//   const cloneObj = deepCopy(eventCenter);
//   console.log(cloneObj)
//   for (let k in eventCenter) obj[k] = cloneObj[k as keyof typeof cloneObj];
//   return obj as EventCenter & typeof obj;
// }
