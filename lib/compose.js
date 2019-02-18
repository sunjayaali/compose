/**
 *
 * function fn1(ctx, next) => {
 *  console.log(1);
 *  next();
 *  console.log(5);
 * }
 *
 * function fn2(ctx, next) => {
 *  console.log(2);
 *  next();
 *  console.log(4);
 * }
 *
 * composer = compose(fn1, fn2);
 * composer({}, (ctx) => {
 *  console.log(3);
 * });
 *
 * - composer() => fn1()
 * - next() in fn1 => fn2()
 * - next() in fn2 => 2nd argument in composer
 *
 * @param {Array} middlewares
 *
 * @returns {Function}
 */
function compose(middlewares) {
  if (!Array.isArray(middlewares)) throw new TypeError(`Middlewares stack must be an array.`);

  middlewares.forEach((middleware) => {
    if (typeof middleware !== `function`) throw new TypeError(`Middlewares stack must be composed of functions.`);
  });

  return (context, next) => {
    let currentMiddlewareIndex = -1;

    return (async function run(i) {
      if (i <= currentMiddlewareIndex) {
        throw new Error(`next() called more than once.`);
      }

      currentMiddlewareIndex = i;
      const fn = (i === middlewares.length) ? next : middlewares[i];

      if (!fn) {
        return undefined;
      }

      return fn(context, run.bind(null, i + 1));
    }(0));
  };
}

module.exports = compose;
