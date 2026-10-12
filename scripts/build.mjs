import {build} from "esbuild";
await build({entryPoints:["src/main.tsx"],outfile:"site/app.js",bundle:true,minify:true,format:"esm",platform:"browser",jsx:"automatic",alias:{"@":"./src"},define:{"process.env.NODE_ENV":'"production"'}});
console.log("GitHub Pages build ready: site/");
