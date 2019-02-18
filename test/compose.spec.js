const compose = require(`../`);

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms || 1));
}

describe(`Compose`, () => {
  it(`should return a promise`, () => {
    expect(compose([])({})).toBeInstanceOf(Promise);
  });

  it(`should work in correct order`, async () => {
    const arr = [];
    const stack = [];

    stack.push(async (context, next) => {
      arr.push(1);
      await wait(1);
      await next();
      await wait(1);
      arr.push(6);
    });

    stack.push(async (context, next) => {
      arr.push(2);
      await wait(1);
      await next();
      await wait(1);
      arr.push(5);
    });

    stack.push(async (context, next) => {
      arr.push(3);
      await wait(1);
      await next();
      await wait(1);
      arr.push(4);
    });

    await compose(stack)({});
    const expected = [1, 2, 3, 4, 5, 6];
    expect(arr).toStrictEqual(expected);
  });

  it(`should be able compose to be called twice`, async () => {
    const stack = [];

    stack.push(async (context, next) => {
      context.arr.push(1);
      await wait(1);
      await next();
      await wait(1);
      context.arr.push(6);
    });

    stack.push(async (context, next) => {
      context.arr.push(2);
      await wait(1);
      await next();
      await wait(1);
      context.arr.push(5);
    });

    stack.push(async (context, next) => {
      context.arr.push(3);
      await wait(1);
      await next();
      await wait(1);
      context.arr.push(4);
    });

    const fn = compose(stack);
    const ctx1 = { arr: [] };
    const ctx2 = { arr: [] };
    const out = [1, 2, 3, 4, 5, 6];

    await fn(ctx1);
    expect(ctx1.arr).toStrictEqual(out);

    await fn(ctx2);
    expect(ctx2.arr).toStrictEqual(out);
  });

  it(`should work with 0 middleware`, () => {
    expect(() => {
      compose([])({});
    }).not.toThrow();
  });

  it(`should work when yielding at the end of the stack`, async () => {
    const stack = [];
    let called = false;

    stack.push(async (ctx, next) => {
      await next();
      called = true;
    });

    await compose(stack)({});
    expect(called).toBeTruthy();
  });

  it(`should keep the context`, () => {
    const argument = {};
    const stack = [];
    const arr = [];

    stack.push(async (ctx, next) => {
      await next();
      arr.push(ctx);
    });
    stack.push(async (ctx, next) => {
      await next();
      arr.push(ctx);
    });
    stack.push(async (ctx, next) => {
      await next();
      arr.push(ctx);
    });

    const expected = arr.every(context => context === argument);
    expect(expected).toBeTruthy();
  });

  it(`should catch downstream errors`, async () => {
    const arr = [];
    const stack = [];

    stack.push(async (ctx, next) => {
      arr.push(1);
      try {
        await next();
        arr.push(7);
      } catch (err) {
        arr.push(3);
      }
      arr.push(4);
    });

    stack.push(async () => {
      arr.push(2);
      throw new Error();
    });

    await compose(stack)({});
    expect(arr).toStrictEqual([1, 2, 3, 4]);
  });

  it(`should compose with next`, async () => {
    let called = false;
    await compose([])({}, (ctx, next) => {
      ctx.foo = `foo`;
      called = true;
      next();
    });
    expect(called).toBeTruthy();
  });

  it(`should return last returned value`, async () => {
    const stack = [];
    const arr = [];

    stack.push(async (context, next) => {
      arr.push(await next());
      return 2;
    });

    stack.push(async (context, next) => {
      arr.push(await next());
      return 1;
    });

    const expected = [0, 1];
    const tested = await compose(stack)({}, () => 0);
    expect(tested).toStrictEqual(2);
    expect(arr).toStrictEqual(expected);
  });

  it(`should not affect the original middleware array`, () => {
    const middlewares = [];
    const fn1 = (ctx, next) => next();
    middlewares.push(fn1);
    compose(middlewares);
    expect(middlewares.every(middleware => middleware === fn1)).toBeTruthy();
  });

  it(`should return value from calling passed next`, async () => {
    const stack = [];
    const count = 0;

    stack.push((ctx, next) => next());

    expect(await compose(stack)({}, () => `${count}a`)).toStrictEqual(`0a`);
  });

  describe(`Errors`, () => {
    it(`should only accept an array`, () => {
      expect(() => {
        compose();
      }).toThrowError(TypeError);
    });

    it(`should only accept middleware as functions`, () => {
      expect(() => {
        compose([{}]);
      }).toThrowError(TypeError);
    });

    it(`should reject on errors in middleware`, async () => {
      const stack = [];

      stack.push(() => {
        throw new Error();
      });

      await expect(compose(stack)({})).rejects.toThrowError();
    });

    it(`should throw if next() is called multiple times`, async () => {
      const stack = [];
      stack.push(async (ctx, next) => {
        await next();
        await next();
      });
      await expect(compose(stack)({})).rejects.toThrowError(Error);
    });

    it(`should handle errors in wrapped non-async functions`, async () => {
      const stack = [];

      stack.push(() => {
        throw new Error();
      });

      await expect(compose(stack)({})).rejects.toThrowError(Error);
    });

    it(`should throw if next() called multiple times`, async () => {
      const stack = [];

      stack.push(async (ctx, next) => {
        await next();
      });

      stack.push(async (ctx, next) => {
        await next();
        await next();
      });

      expect.hasAssertions();

      try {
        await compose(stack)({});
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
