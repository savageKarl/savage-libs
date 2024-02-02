import { Metadata } from '../../src/utils/metadata'
import { type MetaData } from '../../src/utils/userscript'

import { splicePath } from './common'

const config: MetaData = {
  name: 'testing',
  namespace: 'https://github.com/savage181855',
  description: 'this is just a test',
  icon: 'https: // test.com',
  grant: ['GM.addElement', 'GM.addStyle'],
  author: 'savage',
  antifeature: [
    ['ads', 'We show you ads', 'fr'],
    ['ads', 'We show you ads']
  ],
  require: ['https://test.com.js'],
  include: ['*', 'www.google.com', 'github.com'],
  match: ['*', 'www.google.com', 'github.com'],
  excludeMatch: ['*', 'www.google.com', 'github.com'],
  runAt: 'document_end'
}

describe('metadata', () => {
  test('generate metadata', () => {
    const metadata = new Metadata(config)
    expect(metadata.generate()).toMatchFileSnapshot(splicePath('metadata.js'))
  })
})
