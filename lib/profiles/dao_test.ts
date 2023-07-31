import { LibSqlClient } from "deps";
import { assertEquals } from "dev_deps";
import { createClient } from "lib/libsql/denodrivers/client.ts";

function withClient(
    f: (c: LibSqlClient, t: Deno.TestContext) => Promise<void>,
    extraConfig: Partial<{ scripts?: string[] }> = {}
): (t: Deno.TestContext) => Promise<void> {
    return async (t: Deno.TestContext) => {
        const fs = Deno.createSync("test.db");
        const c = createClient({
            url: "file:test.db",
            ...extraConfig,
        });
        try {
            extraConfig.scripts?.forEach(($path) =>
                c.executeMultiple(
                    new TextDecoder("utf-8").decode(Deno.readFileSync($path))
                )
            );

            await f(c, t);
        } finally {
            c.close();
            fs.close();

            Deno.removeSync("test.db");
        }
    };
}

// Domain Model
type Person = {
    id: number;
    name: string;
    age: number;
    city: string;
};

Deno.test("Profiles()", async (test) => {
    await test.step(
        "step 1",
        withClient(
            async (c, test) => {
                await test.step("select all from table", async (_) => {
                    const rs = await c.execute(
                        "SELECT id, name, age, city FROM people;"
                    );
                    assertEquals(rs.rows.length, 2);
                });

                await test.step("select all from table", async (_) => {
                    const rs = await c.execute({
                        sql: "SELECT id, name, age, city FROM people WHERE age = :age;",
                        args: { age: 15 },
                    });

                    assertEquals(rs.rows.length, 1);
                    assertEquals(rs.rows[0].name, "Peter Parker");
                });

                await test.step("select all from table", async (_) => {
                    const rs = await c.execute({
                        sql: "SELECT id, name, age, city FROM people WHERE age = :city;",
                        args: { city: "lhr" },
                    });

                    assertEquals(rs.rows.length, 0);
                });
            },
            { scripts: ["tests/assets/people.sql"] }
        )
    );
});
