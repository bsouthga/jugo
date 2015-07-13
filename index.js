// babel transpilation hook, include experimentals
require("babel/register")({
  stage: 0
});

module.exports = require("./jugo.js");
