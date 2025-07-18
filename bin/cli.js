#!/usr/bin/env node

import * as https from 'https';
import * as fs from "fs";
import * as path from "path"
import {compile} from "./compile.js"

function readDir(v, files = {}) {
    const s = fs.readdirSync(v);
    for(const name of s) {
        const p = path.join(v, name);
        const stat = fs.statSync(p);
        if(stat.isDirectory()) {
            readDir(p, files);
        } else {
            if(p.endsWith(".jspp"))
                files[p] = {
                    path: p.slice(0, -2),
                    content: fs.readFileSync(p, "utf8"),
                };
        }
    }
    return files;
}

const [
    _a, _,
    name = "main.jspp",
    p = ".",
    out = "main.js",
] = process.argv;
const files = (() => {
    if(fs.statSync(p).isFile()) {
        return [
            {
                path: p.slice(0, -2),
                content: fs.readFileSync(p, "utf8")
            }
        ];
    } else {
        return readDir(p);
    }
})()


const compts = {};
function addcompile(filename) {
    if(compts[filename]) return;
    if(!files[filename]) {
        console.error("Error: file " + filename + " does not exist");
        process.exit(1);
    }
    const [code, next] = compile(files[filename].content);
    compts[filename] = code;
    for(const name of next) {
        addcompile(name);
    }
}

function done(std) {
    const get = `
if(__jspp__modules__.cache.has(k)) return __jspp__modules__.cache.get(k);
const v = __jspp__modules__.v.get(k)();
__jspp__modules__.cache.set(k, v);
return v;
    `
    let str = "(function() {" + std + "\nconst __jspp__modules__ = {v: new Map, cache: new Map,get(k){"+get+"}, set(k, v){__jspp__modules__.v.set(k, v)}}\n" 
    for(const [fname, contents] of Object.entries(compts)) {
        str += `__jspp__modules__.set("${fname}", function(){
const __jspp__exports__ = {};
${contents}
return __jspp__exports__;
});\n`
    }
    str += `(function() {
    const mod = __jspp__modules__.get("${name}");
    for(const [k, v] of Object.entries(mod)) {
        window[k] = v;
    }
})()})();`
    fs.writeFileSync(out, str);
}

addcompile(name);
https.get('https://raw.githubusercontent.com/chickencuber/jspp-transpile/refs/heads/main/std.js', (res) => {
    let data = '';

    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        done(data);
    });
}).on('error', (err) => {
    console.error('Error fetching:', err);
});


