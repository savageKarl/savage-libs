# Picox

> A lib base on `picocolors` for terminal color ouput, support chainable API.

## Feature

- support chainable API
- support mutiple arguments

## How to use

```ts
import picox from 'picox'

console.log(picox.bgBlue('hello'))
console.log(picox.green('hello', 'world'))
console.log(picox.bgBlue.yellow('hello'))
```
