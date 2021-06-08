#!/usr/bin/env node

// import {readFileSync} from "fs";
// console.log(`ycplmon ${JSON.parse(readFileSync("package.json")).version} started!`);

//import {startupConsole} from "../lib/cjs/index.js";
const {startupConsole} = require("../lib/cjs/index.js");
startupConsole();
