# Savage-log

> A logger that outputs logs on the terminal.

## Installtion

::: code-group

```[npm]
npm i savage-log
```

```[pnpm]
pnpm add savage-log
```

```[yarn]
yarn add savage-log
```

:::

## Feature

- success
- info
- warn
- error
- setSilent
- setLogLevel

## How to use

```ts
import { createLogger } from 'savage-log'

const logger = createLogger({ label: 'I am label' })

logger.success('hi, there.')
logger.info('hi, there.')
logger.error('hi, there.')
logger.warn('hi, there.')

logger.setLogLevel('warn')

logger.info('you cannot see me.')
logger.success('you cannot see me!')
logger.warn('you can see me.')
logger.error('you can see me.')

logger.setSilent(true)

console.log(logger.logLevel)
console.log(logger.isSilent)

logger.success('you cannot see me!')
logger.info('you cannot see me.')
logger.warn('you cannot see me!')
logger.error('you cannot see me!')
```


# Issues

Please let me know if there are any issues, click this [link](https://github.com/savage181855/savage-libs/issues).
