#!/usr/bin/env node

// import {readFileSync} from "fs";
// console.log(`ycplmon ${JSON.parse(readFileSync("package.json")).version} started!`);

//import {startupConsole} from "../dist/src/index.js";
const {startupConsole} = require("../dist/src/index.js");
startupConsole();
