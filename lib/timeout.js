/*
  timeout returning promise resolving to returned value of function

  timeout : Function -> Integer -> Promise
 */
const timeout = (fn, time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { resolve(fn()); }, time);
  });
};

export default timeout;
