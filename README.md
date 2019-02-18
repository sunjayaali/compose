# compose

A function composer utility to generate middleware.

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
