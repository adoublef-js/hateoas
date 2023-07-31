import { assertEquals, assertThrows } from "dev_deps";
import { Id } from "lib/id/cuid_2.ts";

Deno.test("Id()", async (test) => {
    await test.step("returns a valid cuid2 from an empty constructor", () => {
        const id = new Id();
        assertEquals(id.length, 24);
    });

    await test.step("returns a valid cuid2 from a raw string", () => {
        const raw = "nc6bzmkmd014706rfda898to";
        const id = new Id(raw);
        assertEquals(id.toString(), raw);
    });

    await test.step("throws a type error from invalid raw string", () => {
        assertThrows(() => new Id("not valid"));
    });
});
