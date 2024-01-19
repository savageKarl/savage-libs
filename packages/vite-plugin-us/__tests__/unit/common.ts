import { join } from 'path'

export function splicePath(p: string) {
	return join('__fileSnapshot__', p)
}
