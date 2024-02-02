import { runAt, gmWindow, incompatibleFun, gmFunctions } from './constants'

type GMLiterals<T extends string> = [`GM_${T}` | `GM.${T}`]
type GMWindow = (typeof gmWindow)[number]

export type IncompatibleFun = (typeof incompatibleFun)[number]

export type Grants = Exclude<
  GMWindow | GMLiterals<(typeof gmFunctions)[number]>[number],
  (typeof incompatibleFun)[number]
>

/**
 * version: @see https://www.tampermonkey.net/changelog.phpversion=4.19.0&ext=dhdg
 * document: @see https://www.tampermonkey.net/documentation.phpext=dhdg&version=4.19.0
 */
export interface UserScript {
  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:name
   */
  name: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:namespace
   */
  namespace?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:copyright
   */
  copyright?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:version
   */
  version: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:description
   */
  description?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:icon
   */
  icon?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:icon
   */
  iconURL?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:icon
   */
  defaulticon?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:icon64
   */
  icon64?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:icon64
   */
  icon64URL?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:grant
   */
  grant?: Grants[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:author
   */
  author?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:homepage
   */
  homepage?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:homepage
   */
  homepageURL?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:homepage
   */
  website?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:homepage
   */
  source?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:antifeature
   */
  antifeature?: [type: string, value: string, tag?: string][]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:require
   */
  require?: string[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:resource
   */
  resource?: [key: string, value: string][]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:include
   */
  include?: string[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:match
   * @see https://violentmonkey.github.io/api/metadata-block/#match--exclude-match
   */
  match: string[]

  /**
   * @see https://violentmonkey.github.io/api/metadata-block/#match--exclude-match
   */
  excludeMatch?: string[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:exclude
   */
  exclude?: string[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:run_at
   */
  runAt?: (typeof runAt)[number]

  /**
   * @see https://www.tampermonkey.net/documentation.phpmeta:sandbox
   */
  sandbox?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:connect
   */
  connect?: string[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:noframes
   */
  noframes?: boolean

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:updateURL
   */
  updateURL?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:downloadURL
   */
  downloadURL?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:supportURL
   */
  supportURL?: string

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:webRequest
   */
  webRequest?: string[]

  /**
   * @see https://www.tampermonkey.net/documentation.php#meta:unwrap
   */
  unwrap?: boolean
}

export type MetaData = Partial<UserScript>
