import { assert } from "https://deno.land/std@0.196.0/assert/assert.ts";
import { assertEquals } from "https://deno.land/std@0.196.0/assert/assert_equals.ts";
import { Id } from "lib/id/ulid.ts";

Deno.test("Id()", async (test) => {
    await test.step("generate random id", () => {
        const a = new Id();
        assertEquals(a.length, 26);
    });

    await test.step("generate Id object from raw string", () => {
        const raw = "01ARYZ6S41YYYYYYY0YYYYYYZ1";
        const a = new Id(raw);
        assertEquals(a.length, 26);
    });

    await test.step("localCompare()", async (test) => {
        await test.step("a comes before b", () => {
            const a = new Id();
            const b = new Id();

            assertEquals(a.localeCompare(b), -1);
        });
    });
});
