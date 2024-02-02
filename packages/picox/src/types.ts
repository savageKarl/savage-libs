export interface StylesLogInstance {
  (...args: unknown[]): string
  isColorSupported: boolean
  reset: this
  bold: this
  dim: this
  italic: this
  underline: this
  inverse: this
  hidden: this
  strikethrough: this
  black: this
  red: this
  green: this
  yellow: this
  blue: this
  magenta: this
  cyan: this
  white: this
  gray: this
  bgBlack: this
  bgRed: this
  bgGreen: this
  bgYellow: this
  bgBlue: this
  bgMagenta: this
  bgCyan: this
  bgWhite: this
}
