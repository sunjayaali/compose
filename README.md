# compose

A function composer utility to generate middleware.

[![CircleCI](https://circleci.com/gh/xyluet/compose/tree/master.svg?style=shield)](https://circleci.com/gh/xyluet/compose/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/xyluet/compose/badge.svg?branch=master)](https://coveralls.io/github/xyluet/compose?branch=master)
[![codecov](https://codecov.io/gh/xyluet/compose/branch/master/graph/badge.svg)](https://codecov.io/gh/xyluet/compose)



# Usage

```js
const compose = require(`@xyluet/compose`);

function fn1(ctx, next) => {
  // you can get value of ctx
  // console.log(ctx);

  console.log(1);
  next();
  console.log(5);
}

function fn2(ctx, next) => {
  console.log(2);
  next();
  console.log(4);
}

const composer = compose([fn1, fn2]);
const middleware = composer({}, (ctx, next) => {
  console.log(3);
});
// will log 1, 2, 3, 4, 5
```

# Install

```shell
npm i @xyluet/compose
```

# License
MIT
