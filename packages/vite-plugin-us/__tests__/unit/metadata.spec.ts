import { generateHeadMeta } from 'vite-plugin-us/utils/generateMetadata'
import type { HeadMetaData } from 'vite-plugin-us/types/userscript'

const res = `// ==UserScript==
// @name                           testing
// @namespace                      https://github.com/savage181855
// @description                    this is just a test
// @icon                           https: // test.com
// @grant                          GM.addElement
// @grant                          GM.addStyle
// @author                         savage
// @antifeature:fr     ads         We show you ads
// @antifeature        ads         We show you ads
// @require                        https://test.com.js
// @include                        *
// @include                        www.google.com
// @include                        github.com
// @match                          *
// @match                          www.google.com
// @match                          github.com
// @exclude-match                  *
// @exclude-match                  www.google.com
// @exclude-match                  github.com
// @run-at                         document_end
// ==/UserScript==`

const config: HeadMetaData = {
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
		expect(generateHeadMeta(config)).toBe(res)
	})
})
