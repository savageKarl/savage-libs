import { mergeOptions } from '../../src/utils/optionsMerge'
import type { UsOptions } from '../../src/utils/types'

import { splicePath } from './common'

describe('optionsMerge', () => {
  it('should merged options', () => {
    const options: UsOptions = {
      entry: './src/main.ts',
      metaData: {
        name: 'savage',
        include: ['http://baidu.com']
      }
    }

    expect(mergeOptions(options)).toMatchFileSnapshot(
      splicePath('optionsMerge.js')
    )
  })
})
