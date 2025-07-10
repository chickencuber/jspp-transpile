//extra runtime stuff
class Pointer {
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

function* range(s, e, inc=1) {
    if(e === undefined) {
        e = s;
        s = 0;
    }
    for(let i = s; i < e; i+=inc) {
        yield i;
    }
}

function wait(millis) {
    return new Promise((r) => {
        setTimeout(r, millis)
    })
}

Object.addAll = function(obj, values) {
    for(const [k, v] of Object.entries(values)) {
        obj[k] = v; 
    } 
}

if(!Symbol.overload) Symbol.overload = Symbol("overload");
for(const v of [
    String,
    Number,
    Boolean,
    BigInt,
]) {
    v.prototype[Symbol.overload] = {
        //math
        ["+"](other) {
            return this.valueOf() + other.valueOf();
        },
        ["-"](other) {
            return this.valueOf() - other.valueOf();
        },
        ["*"](other) {
            return this.valueOf() * other.valueOf();
        },
        ["/"](other) {
            return this.valueOf() / other.valueOf();
        },
        ["%"](other) {
            return this.valueOf() % other.valueOf();
        },
        ["**"](other) {
            return this.valueOf() ** other.valueOf();
        },
        //bitwise
        ["&"](other) {
            return this.valueOf() & other.valueOf();
        },
        ["|"](other) {
            return this.valueOf() | other.valueOf();
        },
        ["^"](other) {
            return this.valueOf() ^ other.valueOf();
        },
        ["<<"](other) {
            return this.valueOf() << other.valueOf();
        },
        [">>"](other) {
            return this.valueOf() >> other.valueOf();
        },
        [">>>"](other) {
            return this.valueOf() >>> other.valueOf();
        },
        ["~"]() {
            return ~this.valueOf();
        },
        //logic
        ["&&"](other) {
            return this.valueOf() && other.valueOf();
        },       
        ["||"](other) {
            return this.valueOf() || other.valueOf();
        },
        ["!"]() {
            return !this.valueOf();
        },
        //comparision
        ["=="](other) {
            return this.valueOf() == other.valueOf();
        },
        ["!="](other) {
            return this.valueOf() != other.valueOf();
        },
        ["<"](other) {
            return this.valueOf() < other.valueOf();
        },
        [">"](other) {
            return this.valueOf() > other.valueOf();
        },
        ["<="](other) {
            return this.valueOf() <= other.valueOf();
        },
        [">="](other) {
            return this.valueOf() >= other.valueOf();
        },
        //assignment
        ["+="](other){
            let v = this.valueOf();
            v += other.valueOf();
            return v;
        },
        ["-="](other){
            let v = this.valueOf();
            v -= other.valueOf();
            return v;
        },
        ["*="](other){
            let v = this.valueOf();
            v *= other.valueOf();
            return v;
        },
        ["/="](other){
            let v = this.valueOf();
            v /= other.valueOf();
            return v;
        },
        ["%="](other){
            let v = this.valueOf();
            v %= other.valueOf();
            return v;
        },
        ["**="](other){
            let v = this.valueOf();
            v **= other.valueOf();
            return v;
        },
        ["<<="](other){
            let v = this.valueOf();
            v <<= other.valueOf();
            return v;
        },
        [">>="](other){
            let v = this.valueOf();
            v >>= other.valueOf();
            return v;
        },
        [">>>="](other){
            let v = this.valueOf();
            v >>>= other.valueOf();
            return v;
        },
        ["&="](other){
            let v = this.valueOf();
            v &= other.valueOf();
            return v;
        },
        ["^="](other){
            let v = this.valueOf();
            v ^= other.valueOf();
            return v;
        },
        ["|="](other){
            let v = this.valueOf();
            v |= other.valueOf();
            return v;
        },
        ["&&="](other){
            let v = this.valueOf();
            v &&= other.valueOf();
            return v;
        },
        ["||="](other){
            let v = this.valueOf();
            v ||= other.valueOf();
            return v;
        },
        ["++"]() {
            let v = this.valueOf();
            v++;
            return v;
        },
        ["--"]() {
            let v = this.valueOf();
            v--;
            return v;
        }
    };
}



String.prototype[Symbol.overload]["*"] = function(other) {
    return this.repeat(other);
}

function __multiple_decor(...decorators) {
    return (t, type) => {
        decorators.forEach(v => {
            t = v(t, type); //applies decorators the function
        });
        return t;
    }
}

if(!Symbol.display) Symbol.display = Symbol("display");

window.console = new Proxy(
    window.console,
    {
        get(t, prop) {
            if(prop === "dir") return t.dir;
            return (...args) => {
                const a = args.map((v) => {
                    if(v[Symbol.display]) {
                        return v[Symbol.display]();
                    } else {
                        return v.toString();
                    }
                });
                t[prop](...a);
            };
        },
    }
);



