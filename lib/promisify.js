/*
  Wrap a function with a node-style callback with a
  promise generating function

  promisify : Function -> Function
 */
const promisify = fn => function(...args) {
  return new Promise((resolve, reject) => {
    fn.apply(this, args.concat((error, results) => {
      error ? reject(error) : resolve(results);
    }));
  });
};


export default promisify;
