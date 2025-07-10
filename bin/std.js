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
    v.prototype[Symbol.overload] =  {
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

export function __multiple_decor(...decorators) {
    return (t, type) => {
        decorators.forEach(v => {
            t = v(t, type); //applies decorators the function
        });
        return t;
    }
}

