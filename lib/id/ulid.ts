import { decodeTime, ulid } from "https://deno.land/x/ulid@v0.2.1/mod.ts";
import { assert } from "https://deno.land/std@0.196.0/assert/assert.ts";

// https://github.com/ulid/spec
// https://github.com/kt3k/ulid/blob/main/mod.ts
export class Id {
    #value: string;

    constructor(id?: string) {
        try {
            if (id) {
                assert(decodeTime(id));
                this.#value = id;
            } else {
                this.#value = ulid();
            }
        } catch (error) {
            if (!(error instanceof Error)) {
                throw Error("unrecognized error", { cause: error });
            }

            throw new TypeError(`${error.message}`);
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
    // https://github.com/oklog/ulid/blob/main/ulid.go#L480C1-L484C2
    localeCompare(other: Id): number {
        return this.#value.localeCompare(other.#value);
    }

    static localeCompare(a: Id, b: Id): number {
        return a.localeCompare(b);
    }

    /** Creates a string representation of an Id */
    static toString(): string {
        return new Id().toString();
    }
}
