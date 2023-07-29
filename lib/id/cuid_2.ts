import z from "lib/parse/parser.ts";

export class Id {
    #value: string;
    constructor(id?: string) {
        try {
            this.#value = z.cuid2().parse(id);
        } catch (_) {
            throw new TypeError(`${id} is not a valid Cuid2`);
        }
    }
    /** String representation of an Id */
    toString(): string {
        return this.#value;
    }
    /** Length returns the size of the Id */
    get length() {
        return this.#value.length;
    }
    /** Creates a string representation of an Id */
    static toString(): string {
        return new Id().toString();
    }
}
