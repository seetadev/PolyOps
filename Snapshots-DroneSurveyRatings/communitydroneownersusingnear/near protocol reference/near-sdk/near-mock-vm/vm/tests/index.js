const v8 = require('v8');
let runner = require('..').VMRunner;
let fs = require("fs");
let assert = require("assert");

const nodeVersion = process.versions.node;

if (
    parseInt(nodeVersion.substring(0, nodeVersion.indexOf('.'))) < 16
) {
    v8.setFlagsFromString("--experimental-wasm-bigint");
}

let bin = fs.readFileSync(__dirname + "/../../build/debug/main.wasm");
// console.log(bin.length)
let instd = Buffer.from(runner.instrumentBinary(bin));
assert(WebAssembly.validate(instd), "binary is valid wasm");
// assert(instd.length - bin.length > 0 , "instrumented binary should be bigger");
// const original = new WebAssembly.Module(bin);
const instrumented = new WebAssembly.Module(instd);
// console.log(WebAssembly.Module.imports(original));
const newImports = WebAssembly.Module.imports(instrumented);
assert(newImports.some(_import => _import.name == "gas" && _import.kind == "function" ),
      "Instrumented module's imports should include a gas function");