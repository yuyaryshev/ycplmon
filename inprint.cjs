//        ...require("JSON5").parse(require("fs").readFileSync("package.json", "utf-8"))?.prettier,

module.exports = {
    files: ["src/**/*.{ts,cts,mts,tsx,js,jsx,cjs,mjs}"],
    inprint: import("./dist/inprint/main.js").inprint,
    embeddedFeatures: "first",
    forceProcessTermination: true,
    prettierOpts: { filepath: __dirname, ...require("JSON5").parse(require("fs").readFileSync("package.json", "utf-8"))?.prettier, parser:"typescript"},
};
