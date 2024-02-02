const fns = Object.keys(global.console)

export function mockConsole() {
  const origin = { ...console }

  fns.forEach((f) => {
    // @ts-ignore
    global.console[f] = vi.fn((...args: any) => args)
  })

  return () => {
    global.console = origin
  }
}
