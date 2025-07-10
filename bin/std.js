//extra runtime stuff
export class Pointer {
    #get;
    #set;
    constructor(get, set) {
        this.#get = get;
        this.#set = set;
    }
    get deref() {
        return this.#get();
    }
    set deref(v) {
        return this.#set(v);
    }
}

export function* range(s, e, inc=1) {
    if(e === undefined) {
        e = s;
        s = 0;
    }
    for(let i = s; i < e; i+=inc) {
        yield i;
    }
}
Symbol.overload = Symbol("overload")

export function wait(millis) {
    return new Promise((r) => {
        setTimeout(r, millis)
    })
}

Object.addAll = function(obj, values) {
    for(const [k, v] of Object.entries(values)) {
        obj[k] = v; 
    } 
}
for(const v of [
    String,
    Number,
    Boolean,
    BigInt,
]) {
    v[Symbol.overload] = {
        //math
        ["+"](a, b) {
            return a.valueOf() + b.valueOf();
        },
        ["-"](a, b) {
            return a.valueOf() - b.valueOf();
        },
        ["*"](a, b) {
            return a.valueOf() * b.valueOf();
        },
        ["/"](a, b) {
            return a.valueOf() / b.valueOf();
        },
        ["%"](a, b) {
            return a.valueOf() % b.valueOf();
        },
        ["**"](a, b) {
            return a.valueOf() ** b.valueOf();
        },
        //bitwise
        ["&"](a, b) {
            return a.valueOf() & b.valueOf();
        },
        ["|"](a, b) {
            return a.valueOf() | b.valueOf();
        },
        ["^"](a, b) {
            return a.valueOf() ^ b.valueOf();
        },
        ["<<"](a, b) {
            return a.valueOf() << b.valueOf();
        },
        [">>"](a, b) {
            return a.valueOf() >> b.valueOf();
        },
        ["~"](a) {
            return ~a.valueOf();
        },
        //logic
        ["&&"](a, b) {
            return a.valueOf() && b.valueOf();
        },       
        ["||"](a, b) {
            return a.valueOf() || b.valueOf();
        },
        ["!"](a) {
            return !a.valueOf();
        },
        //comparision
        ["=="](a, b) {
            return a.valueOf() == b.valueOf();
        },
        ["!="](a, b) {
            return a.valueOf() != b.valueOf();
        },
        ["<"](a, b) {
            return a.valueOf() < b.valueOf();
        },
        [">"](a, b) {
            return a.valueOf() > b.valueOf();
        },
        ["<="](a, b) {
            return a.valueOf() <= b.valueOf();
        },
        [">="](a, b) {
            return a.valueOf() >= b.valueOf();
        },
        //assignment
        ["+="](a, b){
            let v = a.valueOf();
            v += b.valueOf();
            return v;
        },
        ["-="](a, b){
            let v = a.valueOf();
            v -= b.valueOf();
            return v;
        },
        ["*="](a, b){
            let v = a.valueOf();
            v *= b.valueOf();
            return v;
        },
        ["/="](a, b){
            let v = a.valueOf();
            v /= b.valueOf();
            return v;
        },
        ["%="](a, b){
            let v = a.valueOf();
            v %= b.valueOf();
            return v;
        },
        ["**="](a, b){
            let v = a.valueOf();
            v **= b.valueOf();
            return v;
        },
        ["<<="](a, b){
            let v = a.valueOf();
            v <<= b.valueOf();
            return v;
        },
        [">>="](a, b){
            let v = a.valueOf();
            v >>= b.valueOf();
            return v;
        },
        ["&="](a, b){
            let v = a.valueOf();
            v &= b.valueOf();
            return v;
        },
        ["^="](a, b){
            let v = a.valueOf();
            v ^= b.valueOf();
            return v;
        },
        ["|="](a, b){
            let v = a.valueOf();
            v |= b.valueOf();
            return v;
        },
        ["&&="](a, b){
            let v = a.valueOf();
            v &&= b.valueOf();
            return v;
        },
        ["||="](a, b){
            let v = a.valueOf();
            v ||= b.valueOf();
            return v;
        },
        ["++"](a) {
            let v = a.valueOf();
            v++;
            return v;
        },
        ["--"](a) {
            let v = a.valueOf();
            v--;
            return v;
        }
    };
}

String[Symbol.overload]["*"] = function(a, b) {
    return a.repeat(b);
}

export function __multiple_decor(...decorators) {
    return (t, type) => {
        decorators.forEach(v => {
            t = v(t, type); //applies decorators the function
        });
        return t;
    }
}

