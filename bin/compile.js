import * as acorn from "acorn";
import * as astring from "astring";
import "./std.js"


//language
const macros = new Map();
const alias = new Map();
const modules = [];

const types = acorn.tokTypes;
types.alias = (() => {
    const t = JSON.parse(JSON.stringify(types.name));
    t.label = "alias";
    return t;
})();

types.macro = (() => {
    const t = JSON.parse(JSON.stringify(types.name));
    t.label = "macro";
    return t;
})();

types.decorator = (() => {
    const t = JSON.parse(JSON.stringify(types.name));
    t.label = "decorator";
    return t;
})();

const overloadables = [
    //math
    "+",
    "-",
    "*",
    "/",
    "%",
    "**",
    //bitwise
    "&",
    "|",
    "^",
    "<<",
    ">>",
    ">>>",
    "~",
    //logic
    "&&",
    "||",
    "!",
    //comparision
    "==",
    "!=",
    "<",
    ">",
    "<=",
    ">=",
    //assignment
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "**=",
    "<<=",
    ">>=",
    ">>>=",
    "&=",
    "^=",
    "|=",
    "&&=",
    "||=",
    "++",
    "--",
]

function Macros(Parser) {
    return class extends Parser {
        constructor(...args) {
            super(...args);
        }
        getTokenFromCode(c) {
            if (String.fromCharCode(c) === "@") {
                this.pos++;
                return this.finishToken(types.decorator);
            }
            super.getTokenFromCode(c);
        }
        nextToken() {
            super.nextToken();
            if (alias.has(this.value)) {
                const { value, type } = alias.get(this.value);
                this.value = value;
                this.type = type;
            }
            if (this.value === "alias") {
                this.type = types.alias;
            }
            if (this.value === "macro") {
                this.type = types.macro;
            }
        }
        parseMacroArgs() {
            let startPos = this.start;
            const l = types.parenL;
            const r = types.parenR;
            this.expect(l);
            const args = [];
            let depth = 1;
            while (depth > 0) {
                if (this.type === l) {
                    depth++;
                } else if (this.type === r) {
                    depth--;
                } else if (this.type === types.eof) {
                    this.unexpected();
                } else if (this.type === types.comma) {
                    if (depth === 1) {
                        const endPos = this.start + 1;
                        const content = this.input
                            .slice(startPos, endPos)
                            .trim()
                            .slice(1, -1)
                            .trim();
                        args.push(content);
                        startPos = this.start;
                    }
                }
                this.next();
            }
            const endPos = this.start;
            const content = this.input
                .slice(startPos, endPos)
                .trim()
                .slice(1, -1)
                .trim();
            args.push(content);
            startPos = this.start;
            return args.map((v) => v.trim()).filter((v) => v !== "");
        }
        toAssignable(t, e, i) {
            if (t.type === "MacroInvocation") {
                return t;
            }
            return super.toAssignable(t, e, i);
        }
        checkLValSimple(t, e, i) {
            if (t.type === "MacroInvocation") {
                return t;
            }
            return super.checkLValSimple(t, e, i);
        }
        parseBalancedBraces() {
            const startPos = this.start;
            this.expect(types.braceL);

            let braceDepth = 1;
            while (braceDepth > 0) {
                if (this.type === types.braceL) {
                    braceDepth++;
                } else if (this.type === types.braceR) {
                    braceDepth--;
                } else if (this.type == types.eof) {
                    this.unexpected();
                }

                this.next();
            }

            const endPos = this.start;
            const content = this.input
                .slice(startPos, endPos)
                .trim()
                .slice(1, -1)
                .trim();

            return content;
        }
        parseDecorator(dname, type) {
            let _export = false;
            if(type === "Exporting_Statement") {
                type = type.body;
                _export = true;
            }
            switch (type.type) {
                case "ClassDeclaration": {
                    const name = type.id.name;
                    let raw = astring.generate(type, {
                        generator: GENERATOR,
                        lineEnd: " ",
                        indent: " ",
                    });
                    raw = raw.trim().endsWith(";")
                    ? raw.trim().slice(0, -1)
                    : raw.trim();
                    const node = this.startNode();
                    node.rawCode = `var ${name} = ${dname}(${raw}, "class");${_export?`__jspp__exports__["${name}"] = ${name}`:""};`;
                    return this.finishNode(node, "MacroInvocation");
                }
                case "FunctionDeclaration": {
                    const fname = type.id.name;
                    let fnraw = astring.generate(type, {
                        generator: GENERATOR,
                        lineEnd: " ",
                        indent: " ",

                    });
                    fnraw = fnraw.trim().endsWith(";")
                    ? fnraw.trim().slice(0, -1)
                    : fnraw.trim();
                    const node = this.startNode();
                    node.rawCode = `var ${fname} = ${dname}(${fnraw}, "function");${_export?`__jspp__exports__["${fname}"] = ${fname}`:""};`;
                    return this.finishNode(node, "MacroInvocation");
                }
                case "MethodDefinition": {
                    if(type.kind !== "method") {
                        this.raise(this.pos, 'decorators can not be put on setters or getters');
                    }
                    const computed = type.computed;
                    const name = astring.generate(type.key, {
                        generator: GENERATOR,
                        lineEnd: " ",
                        indent: " ",

                    });
                    let fn = astring.generate(type.value, {
                        generator: GENERATOR,
                        lineEnd: " ",
                        indent: " ",

                    });
                    fn = fn.trim().endsWith(";")
                    ? fn.trim().slice(0, -1)
                    : fn.trim();
                    const node = this.startNode();
                    node.rawCode = `${computed? '[': ''}${name}${computed? ']': ''}=(function() {
                        return ${dname}((${fn}).bind(this), "function");
                    }).call(this)`
                    return this.finishNode(node, "MacroInvocation");
                }
                default:
                    this.raise(this.pos, `unexpected type "${type.type}"`)
            }
        }
        parseClassElement(constructorAllowsSuper) {
            if(this.type === types.decorator) {
                this.next();
                let dname;
                if(this.type === types.parenL) {
                    dname = "__multiple_decor"
                } else {
                    dname = this.parseExprAtom().name;
                }
                if(this.type === types.parenL) {
                    dname += `(${this.parseMacroArgs().join(", ")})`;
                }
                const type = this.parseClassElement(constructorAllowsSuper);
                return this.parseDecorator(dname, type);
            }

            return super.parseClassElement(constructorAllowsSuper);
        }
        parseProc(type) {
            if(type.type !== "FunctionDeclaration") {
                this.raise(this.pos, "unexpected type " + type.type);
            }
            const code = astring.generate(type, {
                generator: GENERATOR,
                lineEnd: " ",
                indent: " ",

            });
            const v = "(" + (code.endsWith(";") ? code.trim().slice(0, -1) : code.trim()) + ")";
            macros.set(type.id.name, {
                proc: true,
                fn: v,
            });
            const literal = this.startNode();
            literal.value = `'defined proc macro "${type.id.name}"'`;
            literal.raw = literal.value;
            const node = this.startNode();
            node.expression = this.finishNode(literal, "Literal");
            return this.finishNode(node, "EXC"); 
        }
        shouldParseExportStatement() {
            return this.type.keyword === "var" ||
                this.type.keyword === "const" ||
                this.type.keyword === "class" ||
                this.type.keyword === "function" ||
                (this.type === types.name && this.value === "mod")||
                this.isLet() ||
                this.isAsyncFunction()
        }
        parseStatement(ctx, toplevel) {
            if (this.type === types.decorator) {
                this.next();
                let dname;
                if(this.type === types.parenL) {
                    dname = "__multiple_decor"
                } else {
                    dname = this.parseExprAtom().name;
                }
                if(dname === "proc") {
                    if (this.value !== "!") {
                        this.raise(this.pos, "you need to add '!' in order to use 'proc' decorator");
                    }
                    this.next();
                    const type = this.parseStatement(ctx, toplevel);
                    return this.parseProc(type);
                }
                if(this.type === types.parenL) {
                    dname += `(${this.parseMacroArgs().join(", ")})`;
                }
                const type = this.parseStatement(ctx, toplevel);
                return this.parseDecorator(dname, type);
            }
            if (this.type === types.macro) {
                this.next();
                if (this.value !== "!") {
                    this.raise(this.pos, "you need to add '!' in order to use 'macro'");
                }
                this.next();
                const name = this.parseIdent().name;
                const _node = {};
                this.parseFunctionParams(_node);
                _node.params = _node.params.map((v) => v.name);
                _node.body = this.parseBalancedBraces();
                macros.set(name, _node);
                const literal = this.startNode();
                literal.value = `'defined macro "${name}"'`;
                literal.raw = literal.value;
                const node = this.startNode();
                node.expression = this.finishNode(literal, "Literal");
                return this.finishNode(node, "EXC");
            }
            if(this.type === types._import) {
                if(this.options.sourceType !== "module" || !toplevel) {
                    this.raise(this.pos, "import and export must be on the top level")
                }
                this.next();
                if(this.type.label !== "string") {
                    this.raise(this.pos, "expected a string");
                }
                const fs = this.value;
                modules.push(fs);
                this.next();
                if(this.value !== "as" || this.type.label !== "name") {
                    this.raise(this.pos, "expected keyword as");                   
                }
                this.next();
                const name = this.parseIdent().name;
                const node = this.startNode();
                node.file = fs;
                node.ident = name;
                return this.finishNode(node, "Importing_Statement");
            }
            if(this.type === types.name && this.value === "mod") {
                if(this.options.sourceType !== "module" || !toplevel) {
                    this.raise(this.pos, "mod must be on the top level")
                }
                this.next();
                const name = this.parseIdent();
                const block = this.parseBlock(true, this.startNode(), undefined, true);
                const node = this.startNode();
                node.id = name;
                node.block = block;
                return this.finishNode(node, "module_start");
            }
            if(this.type === types._export) {
                if(this.options.sourceType !== "module" || !toplevel) {
                    this.raise(this.pos, "import and export must be on the top level")
                }
                this.next();
                if(this.shouldParseExportStatement()) {
                    const node = this.startNode();
                    node.body = this.parseStatement(ctx, toplevel);
                    return this.finishNode(node, "Exporting_Statement");
                } else {
                    this.raise(this.pos, "unexpected keyword");
                } }
            if (this.type === types.alias) {
                this.next();
                if (this.value !== "!") {
                    this.raise(this.pos, "you need to add '!' in order to use 'alias'");
                }
                this.next();
                const name = this.value;
                if (this.value === undefined) {
                    this.raise(this.pos, "invalid alias name");
                }
                if (this.type !== types.name) {
                    if (this.type === types.num) {
                        this.raise(this.pos, "invalid alias name");
                    }
                    console.warn(
                        "It is not recomended to use a non-ident name for an alias"
                    );
                }
                this.next();
                if (this.value !== "=") {
                    this.raise(this.pos, "expect '='");
                }
                this.next();
                alias.set(name, {
                    value: this.value,
                    type: this.type,
                });
                this.next();
                const literal = this.startNode();
                literal.value = `'defined alias "${name}"'`;
                literal.raw = literal.value;
                const node = this.startNode();
                node.expression = this.finishNode(literal, "Literal");
                return this.finishNode(node, "EXC");
            }
            return super.parseStatement(ctx, toplevel);
        }
        parseBlock(createNewLexicalScope = true, node = this.startNode(), exitStrict, topLevel = false) {
            node.body = []
            this.expect(types.braceL)
            if (createNewLexicalScope) this.enterScope(0)
            while (this.type !== types.braceR) {
                let stmt = this.parseStatement(null, topLevel)
                node.body.push(stmt)
            }
            if (exitStrict) this.strict = false
            this.next()
            if (createNewLexicalScope) this.exitScope()
            return this.finishNode(node, "BlockStatement")
        }
        getName(str) {
            if (!str.includes("v")) {
                return "v";
            }
            if (!str.includes("_v")) {
                return "_v";
            }
            if (!str.includes("v_")) {
                return "v_";
            }
            if (!str.includes("_v_")) {
                return "_v_";
            }
            let i = 0;
            while (str.includes("_v_" + i)) {
                i++;
            }
            return "_v_" + i;
        }
        parseExprAtom() {
            if (this.type === types.bitwiseAND) {
                this.next();
                const ast = this.parseExprAtom();
                const code = astring.generate(ast, {
                    generator: GENERATOR,
                    lineEnd: " ",
                    indent: " ",

                });
                const v = code.endsWith(";") ? code.trim().slice(0, -1) : code.trim();
                const node = this.startNode();
                const n = this.getName(v);
                node.rawCode = `(new Pointer(() => ${v}, ${n} => (${v}) = ${n}))`;
                return this.finishNode(node, "MacroInvocation");
            }
            if (this.type === types.star) {
                this.next();
                const ast = this.parseExprAtom();
                const code = astring.generate(ast, {
                    generator: GENERATOR,
                    lineEnd: " ",
                    indent: " ",

                });
                const v = code.endsWith(";") ? code.trim().slice(0, -1) : code.trim();
                const node = this.startNode();
                node.rawCode = `(${v}).deref`;
                return this.finishNode(node, "MacroInvocation");
            }
            if (macros.has(this.value)) {
                const name = this.value;
                const macro = macros.get(name);
                this.next();
                if (this.value !== "!") {
                    const node = this.startNode();
                    node.name = name;
                    return this.finishNode(node, "Identifier");
                }
                this.next();
                if(macro.proc) {
                    const args = this.parseProcArgs(); 
                    const n = eval(macro.fn)(...args);
                    const node = this.startNode();
                    node.rawCode = n;
                    return this.finishNode(node, "MacroInvocation");
                } else {
                    const args = this.parseMacroArgs();
                    if (args.length !== macro.params.length) {
                        this.raise(
                            this.pos,
                            `macro "${name}" expected ${macro.params.length} ${
                                macro.params.length === 1 ? "arg" : "args"
                            }, ${args.length} were provided`
                        );
                    }
                    let n = macro.body;
                    for (const [i, param] of Object.entries(macro.params)) {
                        const arg = args[i];
                        n = n.replaceAll(new RegExp("(?<!\\\\)\\$" + param, "gm"), arg);
                    }
                    n = n.replaceAll(/\\$/gm, "$");
                    const node = this.startNode();
                    node.rawCode = n;
                    return this.finishNode(node, "MacroInvocation");
                }
            }
            return super.parseExprAtom();
        }
        parseProcArgs() {
            const l = types.parenL;
            const r = types.parenR;
            this.expect(l);
            const args = [];
            let depth = 1;
            while (depth > 0) {
                if (this.type === l) {
                    depth++;
                } else if (this.type === r) {
                    depth--;
                } else if (this.type === types.eof) {
                    this.unexpected();
                }

                args.push({
                    type: this.type,
                    value: this.value,
                    raw: this.input.slice(this.start, this.end),
                });
                this.next();
            }
            args.pop();
            return args;
        }
    };
}

const macroParser = acorn.Parser.extend(Macros);

const GENERATOR = Object.assign({}, astring.GENERATOR, {
    UpdateExpression(node, state) {
        if(!overloadables.includes(node.operator)) {
            useOG(node, state);
            return;
        }
        useSelf(node.argument, state)
        state.write("=(");
            useSelf(node.argument, state)
            state.write(`)[Symbol.overload]["${node.operator}"]()`
        );
    },
    BinaryExpression(node, state) {
        if(!overloadables.includes(node.operator)) {
            useOG(node, state);
            return;
        }
        state.write("(");
            useSelf(node.left, state);
            state.write(`)[Symbol.overload]["${node.operator}"](`);
            useSelf(node.right, state);
            state.write(")");
    },
    EXC() {},
    AssignmentExpression(node, state) {
        if(!overloadables.includes(node.operator)) {
            useOG(node, state);
            return;
        }
        useSelf(node.left, state);
        state.write("=(");
            useSelf(node.left, state);
            state.write(`)[Symbol.overload]["${node.operator}"](`);
            useSelf(node.right, state);
            state.write(")");
    },
    MacroInvocation(node, state) {
        const ast = macroParser.parse(node.rawCode, {
            ecmaVersion: "latest",
            allowAwaitOutsideFunction: true,
        });
        const code = astring.generate(ast, {
            generator: GENERATOR,
            lineEnd: " ",
            indent: " ",

        });
        state.write(
            code.trim().endsWith(";") ? code.trim().slice(0, -1) : code.trim()
        );
    },
    Importing_Statement(node, state) {
        state.write(`const ${node.ident} = (__jspp__modules__.get("${node.file}"));`);
    },
    Exporting_Statement(node, state) {
        useSelf(node.body, state);
        state.write(`;__jspp__exports__["${node.body.id.name}"] = ${node.body.id.name};`);
    },
    module_start(node, state) {
        state.write(`const ${node.id.name} = (function() {
const __jspp__exports__ = {};\n`)
        useSelf(node.block, state); 
        state.write(`\nreturn __jspp__exports__;})();\n`)
    },
    UnaryExpression(node, state) {
        const op = node.operator;
        if(op === "+" || op === "-" || !overloadables.includes(op)) {
            useOG(node, state);
            return;
        }
        state.write("(");
            useSelf(node.argument, state);
            state.write(`)["${op}"]()`);
    },
    EmptyStatement() {}
});
function useSelf(node, state) {
    GENERATOR[node.type](node, state);
}
function useOG(node, state) {
    astring.GENERATOR[node.type].call(GENERATOR, node, state);
}
export function compile(str) {
    macros.clear();
    alias.clear();
    modules.length = 0;
    if (str === '{"message":"Asset does not exist"}') {
        throw new Error("asset does not exist");
    }
    const ast = macroParser.parse(str, {
        ecmaVersion: "latest",
        sourceType: "module",
    });
    const code = astring.generate(ast, {
        generator: GENERATOR,
    });
    return [code.trim(), modules];
}

