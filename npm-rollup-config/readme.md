# savage-rollup-config

rollup 的打包配置，便于统一修改和更新

## api

see d.ts


## notice

tsconfig.json 和 tsconfigDefaults.js文件必须一样，且不可删除其中一个，否则打包ts会报错

## 旧项目引入 eslint 和 prettier

全部统一重置一下


## 多个库管理

一旦在使用中，当前开发的库对配置有问题，需要更改配置的时候，在当前的库先保持一个干净的工作目录，然后再使用hook进行修改配置已达到可以运行的阶段。之后就要把更改统一到`npm-rollup-config`项目，再统一到`rollup-ts`模板项目，之后的库项目都要跟`rollup-ts`模板的内容一致，要一一对应修改，保持一个同步状态。

项目结构要统一跟`rollup-ts`同步

打包配置要统一跟`npm-rollup-config`同步


