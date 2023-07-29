import { createId, z } from "deps";
import { Code } from "lib/parse/parse_code.ts";
import { panic } from "lib/parse/parse_error.ts";

export default {
    cuid2(): z.ZodDefault<z.ZodString> {
        return z.string().cuid2().default(createId);
    },
    string(): z.ZodString {
        return z.string();
    },
    numeric(): z.ZodNumber {
        return this.coerce("number");
    },
    coerce<T extends keyof typeof z.coerce>(
        key: T
    ): ReturnType<(typeof z.coerce)[T]> {
        // NOTE shuts the linter up
        return z.coerce[key]() as ReturnType<(typeof z.coerce)[T]>;
    },
};

export class Parser<Shape extends z.ZodRawShape> {
    constructor(private shape: Shape) {}

    async parse(data?: Record<string, unknown> | null) {
        return await parse(this.shape, data);
    }

    static from<T extends z.ZodRawShape>(shape: T) {
        const parser = new Parser(shape);

        return {
            parse(data?: Record<string, unknown> | null) {
                return parser.parse(data);
            },
        } satisfies Pick<Parser<T>, "parse">;
    }
}

async function parse<S extends z.ZodRawShape>(shape: S, data: unknown) {
    try {
        return await z.object(shape).parseAsync(data);
    } catch (error) {
        if (!(error instanceof z.ZodError)) {
            throw new Error("unknown error");
        }

        panic(Code.InvalidSchema, "Error parsing input");
    }
}
