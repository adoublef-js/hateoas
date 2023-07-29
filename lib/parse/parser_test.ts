import { assert } from "deps";
import z, { Parser } from "lib/parse/parser.ts";

Deno.test("Parser()", async (test) => {
    await test.step("validates input object", async () => {
        const parser = new Parser({
            foo: z.string(),
            bar: z.numeric(),
        });
        const { bar } = await parser.parse({ foo: "Deno", bar: "5173" });
        assert(typeof bar === "number");
    });
});
