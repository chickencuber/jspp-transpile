#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path"
import {compile} from "./compile.js"

function readDir(v) {
    const s = fs.readdirSync(v);
    const files = [];
    for(const name of s) {
        const p = path.join(v, name);
        const stat = fs.statSync(p);
        if(stat.isDirectory()) {
            files.push(...readDir(p));
        } else {
            if(p.endsWith(".jspp"))
                files.push({
                    path: p.slice(0, -2),
                    content: fs.readFileSync(p, "utf8"),
                })
        }
    }
    return files;
}

const [
    _a, _,
    p = ".",
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

for(const v of files) {
    fs.writeFileSync(v.path, compile(v.content));
}

