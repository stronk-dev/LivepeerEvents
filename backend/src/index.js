//Starting point of backend. Simply imports ESM and calls the actual server.js to be loaded.

require = require("esm")(module)
module.exports = require("./server.js")
