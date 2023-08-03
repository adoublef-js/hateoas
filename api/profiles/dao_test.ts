import { LibSqlClient } from "deps";
import { assertEquals } from "dev_deps";
import { createClient } from "lib/libsql/denodrivers/client.ts";

const DATABASE_URL = "test.db";

function withClient(
    f: (c: LibSqlClient, t: Deno.TestContext) => Promise<void>
): (t: Deno.TestContext) => Promise<void> {
    return async (t: Deno.TestContext) => {
        const fs = await Deno.create(DATABASE_URL);

        const c = createClient({
            url: `file:${DATABASE_URL}`,
        });
        try {
            await c.batch([
                "DROP TABLE IF EXISTS profiles",
                `CREATE TABLE profiles (
                    id TEXT,
                    PRIMARY KEY (id)
                );`,
                `CREATE TABLE credentials (
                    profile TEXT UNIQUE,
                    oauth TEXT,
                    PRIMARY KEY (profile, oauth)
                );`,
            ]);

            await f(c, t);
        } finally {
            c.close();
            fs.close();

            await Deno.remove(DATABASE_URL);
        }
    };
}

Deno.test("Profiles()", async (test) => {
    await test.step(
        "step 1",
        withClient(async (c, test) => {
            await test.step("select all from table", async (_) => {
                const rs = await c.execute(
                    "SELECT id, name, age, city FROM people;"
                );
                // c.
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
        })
    );
});
