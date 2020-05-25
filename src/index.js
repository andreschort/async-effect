module.exports = function asyncEffect(fetch, cb) {
  var cancel = false;

  async function run(r) {
    try {
      cb.start && cb.start();
      const result = await fetch();

      if (!cancel) {
        cb.done && cb.done(result);
      }
    } catch (err) {
      if (cancel) return;
      if (r && cb.retry && (await cb.retry(err))) {
        if (cancel) return;
        await run(false);
      } else {
        cb.error && cb.error(err);
      }
    }
  }

  run(true);

  return function cleanup() {
    cancel = true;
  };
};
