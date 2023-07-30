// https://github.com/denodrivers/sqlite3
import { assertRejects } from "https://deno.land/std@0.195.0/assert/assert_rejects.ts";
import { assertStrictEquals } from "https://deno.land/std@0.195.0/assert/assert_strict_equals.ts";
import {
    assertArrayIncludes,
    assertEquals,
} from "https://deno.land/std@0.195.0/assert/mod.ts";
import {
    LibsqlError,
    Config,
    Client,
    InValue,
    IntMode,
    Value,
} from "https://esm.sh/@libsql/client@0.3.1";
import { createClient } from "lib/libsql/denodrivers/client.ts";

function withClient(
    f: (c: Client) => Promise<void>,
    extraConfig: Partial<Config> = {}
): () => Promise<void> {
    return async () => {
        const file = Deno.createSync("test.db");
        const c = createClient({
            url: "file:test.db",
            ...extraConfig,
        });
        try {
            await f(c);
        } finally {
            c.close();
            file.close();
            Deno.removeSync("test.db");
        }
    };
}

// https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts
Deno.test("Sqlite3Client()", async (test) => {
    await test.step(
        "should connect to database",
        // TODO check that it works with real file
        withClient(async () => {})
    );

    await test.step("execute()", async (test) => {
        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L85
        await test.step(
            "query a single value",
            withClient(async (c) => {
                const rs = await c.execute("SELECT 42");
                assertEquals(rs.columns.length, 1);
                assertEquals(rs.rows.length, 1);
            })
        );

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L93
        await test.step(
            "query a single row",
            withClient(async (c) => {
                const rs = await c.execute(
                    "SELECT 1 AS one, 'two' AS two, 0.5 AS three"
                );
                assertArrayIncludes(rs.columns, ["one", "two", "three"]);
                assertEquals(rs.rows.length, 1);

                const r = rs.rows[0];
                assertEquals(r.length, 3);
                assertArrayIncludes(Array.from(r), [1, "two", 0.5]);
                assertArrayIncludes(Object.entries(r), [
                    ["one", 1],
                    ["two", "two"],
                    ["three", 0.5],
                ]);
            })
        );

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L104
        await test.step(
            "query multiple rows",
            withClient(async (c) => {
                const rs = await c.execute(
                    "VALUES (1, 'one'), (2, 'two'), (3, 'three')"
                );
                assertEquals(rs.columns.length, 2);
                assertEquals(rs.rows.length, 3);
                assertArrayIncludes(Array.from(rs.rows[0]), [1, "one"]);
                assertArrayIncludes(Array.from(rs.rows[1]), [2, "two"]);
                assertArrayIncludes(Array.from(rs.rows[2]), [3, "three"]);
            })
        );

        await test.step(
            "multiple statements",
            withClient(async (c) => {
                await c.execute("DROP TABLE IF EXISTS t;");
                await c.execute("CREATE TABLE t (a);");
                await c.execute("INSERT INTO t VALUES (1), (2), (4), (8);");

                const rs = await c.execute("SELECT SUM(a) FROM t");
                assertEquals(rs.rows[0][0], 15);
            })
        );

        // https://github.com/denodrivers/sqlite3/blob/main/doc.md
        await test.step("arguments", async (test) => {
            await test.step(
                "? arguments",
                withClient(async (c) => {
                    const rs = await c.execute({
                        sql: "SELECT ?, ?",
                        args: ["one", "two"],
                    });
                    assertArrayIncludes(Array.from(rs.rows[0]), ["one", "two"]);
                })
            );

            await test.step(
                ": arguments",
                withClient(async (c) => {
                    const rs = await c.execute({
                        sql: "SELECT :one, :two, :three",
                        args: {
                            one: "one",
                            two: "two",
                            three: "three",
                        },
                    });
                    assertArrayIncludes(Array.from(rs.rows[0]), [
                        "one",
                        "two",
                        "three",
                    ]);
                })
            );

            await test.step(
                ":$@ arguments",
                withClient(async (c) => {
                    const rs = await c.execute({
                        sql: "SELECT :one, $two, @three",
                        args: {
                            ":one": ":one",
                            $two: "$two",
                            "@three": "@three",
                        },
                    });
                    assertArrayIncludes(Array.from(rs.rows[0]), [
                        ":one",
                        "$two",
                        "@three",
                    ]);
                })
            );
        });
    });

    await test.step("executeMultiple()", async (test) => {
        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L792
        await test.step(
            "multiple statements",
            withClient(async (c) => {
                await c.executeMultiple(`
                    DROP TABLE IF EXISTS t;
                    CREATE TABLE t (a);
                    INSERT INTO t VALUES (1), (2), (4), (8);
                `);

                const rs = await c.execute("SELECT SUM(a) FROM t");
                assertEquals(rs.rows[0][0], 15);
            })
        );
    });

    await test.step("transaction()", async (test) => {
        await test.step(
            "query multiple rows",
            withClient(async (c) => {
                const txn = await c.transaction("read");

                const rs = await txn.execute(
                    "VALUES (1, 'one'), (2, 'two'), (3, 'three')"
                );
                assertEquals(rs.columns.length, 2);
                assertEquals(rs.rows.length, 3);

                assertArrayIncludes(Array.from(rs.rows[0]), [1, "one"]);
                assertArrayIncludes(Array.from(rs.rows[1]), [2, "two"]);
                assertArrayIncludes(Array.from(rs.rows[2]), [3, "three"]);

                txn.close();
            })
        );

        await test.step(
            "commit()",
            withClient(async (c) => {
                await c.batch(
                    ["DROP TABLE IF EXISTS t", "CREATE TABLE t (a)"],
                    "write"
                );

                const txn = await c.transaction("write");
                await txn.execute("INSERT INTO t VALUES ('one')");
                await txn.execute("INSERT INTO t VALUES ('two')");
                assertEquals(txn.closed, false);
                await txn.commit();
                assertEquals(txn.closed, true);

                const rs = await c.execute("SELECT COUNT(*) FROM t");
                assertEquals(rs.rows[0][0], 2);
                assertRejects(
                    () => txn.execute("SELECT 1"),
                    LibsqlError,
                    "TRANSACTION_CLOSED" //can't check this
                );
            })
        );

        await test.step(
            "rollback()",
            withClient(async (c) => {
                await c.batch(
                    ["DROP TABLE IF EXISTS t", "CREATE TABLE t (a)"],
                    "write"
                );

                const txn = await c.transaction("write");
                await txn.execute("INSERT INTO t VALUES ('one')");
                await txn.execute("INSERT INTO t VALUES ('two')");
                assertEquals(txn.closed, false);
                await txn.rollback();
                assertEquals(txn.closed, true);

                const rs = await c.execute("SELECT COUNT(*) FROM t");
                assertEquals(rs.rows[0][0], 0);
                assertRejects(
                    () => txn.execute("SELECT 1"),
                    LibsqlError,
                    "TRANSACTION_CLOSED" //can't check this
                );
            })
        );

        await test.step(
            "close()",
            withClient(async (c) => {
                await c.batch(
                    ["DROP TABLE IF EXISTS t", "CREATE TABLE t (a)"],
                    "write"
                );

                const txn = await c.transaction("write");
                await txn.execute("INSERT INTO t VALUES ('one')");
                await txn.execute("INSERT INTO t VALUES ('two')");
                assertEquals(txn.closed, false);
                txn.close();
                assertEquals(txn.closed, true);

                const rs = await c.execute("SELECT COUNT(*) FROM t");
                assertEquals(rs.rows[0][0], 0);
                assertRejects(
                    () => txn.execute("SELECT 1"),
                    LibsqlError,
                    "TRANSACTION_CLOSED" //can't check this
                );
            })
        );
    });

    await test.step("batch()", async (test) => {
        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L118
        await test.step(
            "rowsAffected with INSERT",
            withClient(async (c) => {
                await c.batch(
                    ["DROP TABLE IF EXISTS t", "CREATE TABLE t (a)"],
                    "write"
                );
                const rs = await c.execute("INSERT INTO t VALUES (1), (2)");
                assertEquals(rs.rowsAffected, 2);
            })
        );

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L127
        await test.step(
            "rowsAffected with DELETE",
            withClient(async (c) => {
                await c.batch(
                    [
                        "DROP TABLE IF EXISTS t",
                        "CREATE TABLE t (a)",
                        "INSERT INTO t VALUES (1), (2), (3), (4), (5)",
                    ],
                    "write"
                );
                const rs = await c.execute("DELETE FROM t WHERE a >= 3");
                assertEquals(rs.rowsAffected, 3);
            })
        );

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L152C1-L162C9
        await test.step(
            "rows from INSERT RETURNING",
            withClient(async (c) => {
                await c.batch(
                    ["DROP TABLE IF EXISTS t", "CREATE TABLE t (a)"],
                    "write"
                );

                const rs = await c.execute(
                    "INSERT INTO t VALUES (1) RETURNING 42 AS x, 'foo' AS y"
                );
                assertArrayIncludes(rs.columns, ["x", "y"]);
                assertEquals(rs.rows.length, 1);
                assertArrayIncludes(Array.from(rs.rows[0]), [42, "foo"]);
            })
        );
    });

    await test.step("values", async (test) => {
        async function testRoundtrip(
            name: string,
            passed: InValue,
            expected: Value,
            intMode?: IntMode
        ): Promise<void> {
            await test.step(
                name,
                withClient(
                    async (c) => {
                        const rs = await c.execute({
                            sql: "SELECT ?",
                            args: [passed],
                        });
                        assertEquals(rs.rows[0][0], expected);
                    },
                    { intMode }
                )
            );
        }

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L206C3-L209C79
        await testRoundtrip("string", "boomerang", "boomerang");
        await testRoundtrip(
            "string with weird characters",
            "a\n\r\t ",
            "a\n\r\t "
        );
        await testRoundtrip(
            "string with unicode",
            "žluťoučký kůň úpěl ďábelské ódy",
            "žluťoučký kůň úpěl ďábelské ódy"
        );

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L211C2-L213C51
        await testRoundtrip("zero number", 0, 0);
        await testRoundtrip("integer number", -2023, -2023);
        await testRoundtrip("float number", 12.345, 12.345);

        // https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts#L216C9-L220C97
        await testRoundtrip("zero integer", 0n, 0, "number");
        await testRoundtrip("small integer", -42n, -42, "number");
        await testRoundtrip(
            "largest safe integer",
            9007199254740991n,
            9007199254740991,
            "number"
        );

        await test.step(
            "max 64-bit bigint",
            withClient(async (c) => {
                const rs = await c.execute({
                    sql: "SELECT ?||''",
                    args: [9223372036854775807n],
                });
                assertEquals(rs.rows[0][0], "9223372036854775807");
            })
        );

        await test.step(
            "min 64-bit bigint",
            withClient(async (c) => {
                const rs = await c.execute({
                    sql: "SELECT ?||''",
                    args: [-9223372036854775808n],
                });
                assertEquals(rs.rows[0][0], "-9223372036854775808");
            })
        );
    });

    await test.step("ResultSet.toJSON()", async (test) => {
        await test.step({
            name: "bigint row value",
            ignore: true,
            fn: withClient(
                async (c) => {
                    const rs = await c.execute("SELECT 42");
                    const json = rs.toJSON();
                    assertEquals(json["rows"], [["42"]]);
                },
                { intMode: "bigint" }
            ),
        });
    });
});
