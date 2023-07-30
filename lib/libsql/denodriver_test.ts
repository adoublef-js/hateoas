// https://github.com/denodrivers/sqlite3
import { encode } from "https://deno.land/std@0.176.0/encoding/hex.ts";
import { assertRejects } from "https://deno.land/std@0.195.0/assert/assert_rejects.ts";
import {
    assertArrayIncludes,
    assertEquals,
} from "https://deno.land/std@0.195.0/assert/mod.ts";
import {
    BindParameters,
    BindValue,
    Database,
    DatabaseOpenOptions,
    RestBindParameters,
    SqliteError,
} from "https://deno.land/x/sqlite3@0.9.1/mod.ts";
import * as SQL_CONSTANTS from "https://deno.land/x/sqlite3@0.9.1/src/constants.ts";
import {
    InStatement,
    ResultSet,
    TransactionMode,
    Transaction,
    IntMode,
    LibsqlError,
    Value,
    Row,
    Config,
    Client,
    InValue,
} from "https://esm.sh/@libsql/client@0.3.1";
import { Buffer } from "node:buffer";

function withClient(
    f: (c: Client) => Promise<void>,
    extraConfig: Partial<Config> = {}
): () => Promise<void> {
    return async () => {
        // TODO
        const c = createClient({
            url: "file:memdb1?mode=memory&cache=shared",
            ...extraConfig,
        });
        try {
            await f(c);
        } finally {
            c.close();
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
        /*   
        test("rows from INSERT RETURNING", withClient(async (c) => {
        await c.batch([
            "DROP TABLE IF EXISTS t",
            "CREATE TABLE t (a)",
        ], "write");

        const rs = await c.execute("INSERT INTO t VALUES (1) RETURNING 42 AS x, 'foo' AS y");
        expect(rs.columns).toStrictEqual(["x", "y"]);
        expect(rs.rows.length).toStrictEqual(1);
        expect(Array.from(rs.rows[0])).toStrictEqual([42, "foo"]);
    })); */
    });
});

function createClient(config: Config): Client {
    // TODO
    const path = config.url; // https://www.sqlite.org/inmemorydb.html
    const options = {};
    // @ts-ignore I know
    return new Sqlite3Client(path, options, config.intMode);
}

export class Sqlite3Client implements Client {
    #path: string;
    #options: DatabaseOpenOptions;
    #intMode: IntMode;
    closed: boolean;
    protocol: "file";

    constructor(path: string, options: DatabaseOpenOptions, intMode: IntMode) {
        this.#path = path;
        this.#options = options;
        this.#intMode = intMode;
        this.closed = false;
        this.protocol = "file";
    }

    async execute(stmt: InStatement): Promise<ResultSet> {
        this.#checkNotClosed();
        const db = new Database(this.#path, this.#options);
        try {
            return await executeStmt(db, stmt, this.#intMode);
        } finally {
            db.close();
        }
    }

    async batch(
        stmts: Array<InStatement>,
        mode: TransactionMode = "deferred"
    ): Promise<Array<ResultSet>> {
        this.#checkNotClosed();
        const db = new Database(this.#path, this.#options);
        try {
            executeStmt(db, transactionModeToBegin(mode), this.#intMode);
            const resultSets = await Promise.all(
                stmts.map((stmt) => {
                    return executeStmt(db, stmt, this.#intMode);
                })
            );
            executeStmt(db, "COMMIT", this.#intMode);
            return resultSets;
        } finally {
            db.close();
        }
    }

    // deno-lint-ignore require-await
    async transaction(mode: TransactionMode = "write"): Promise<Transaction> {
        this.#checkNotClosed();
        const db = new Database(this.#path, this.#options);
        try {
            executeStmt(db, transactionModeToBegin(mode), this.#intMode);
            return new Sqlite3Transaction(db, this.#intMode);
        } catch (e) {
            db.close();
            throw e;
        }
    }

    // deno-lint-ignore require-await
    async executeMultiple(sql: string): Promise<void> {
        this.#checkNotClosed();
        const db = new Database(this.#path, this.#options);
        try {
            return executeMultiple(db, sql);
        } finally {
            db.close();
        }
    }

    close(): void {
        this.closed = true;
    }

    #checkNotClosed(): void {
        if (this.closed) {
            throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
        }
    }
}

export class Sqlite3Transaction implements Transaction {
    #database: Database;
    #intMode: IntMode;

    /** @private */
    constructor(database: Database, intMode: IntMode) {
        this.#database = database;
        this.#intMode = intMode;
    }

    // deno-lint-ignore require-await
    async execute(stmt: InStatement): Promise<ResultSet> {
        this.#checkNotClosed();
        return executeStmt(this.#database, stmt, this.#intMode);
    }

    // deno-lint-ignore require-await
    async batch(stmts: Array<InStatement>): Promise<Array<ResultSet>> {
        this.#checkNotClosed();
        return Promise.all(
            stmts.map((stmt) =>
                executeStmt(this.#database, stmt, this.#intMode)
            )
        );
    }

    // deno-lint-ignore require-await
    async executeMultiple(sql: string): Promise<void> {
        this.#checkNotClosed();
        return executeMultiple(this.#database, sql);
    }

    // deno-lint-ignore require-await
    async rollback(): Promise<void> {
        if (!this.#database.open) {
            return;
        }
        executeStmt(this.#database, "ROLLBACK", this.#intMode);
        this.#database.close();
    }

    // deno-lint-ignore require-await
    async commit(): Promise<void> {
        this.#checkNotClosed();
        executeStmt(this.#database, "COMMIT", this.#intMode);
        this.#database.close();
    }

    close(): void {
        this.#database.close();
    }

    get closed(): boolean {
        return !this.#database.open;
    }

    #checkNotClosed(): void {
        if (!this.#database.open) {
            throw new LibsqlError(
                "The transaction is closed",
                "TRANSACTION_CLOSED"
            );
        }
    }
}

// deno-lint-ignore require-await
async function executeStmt(
    db: Database,
    stmt: InStatement,
    intMode: IntMode
): Promise<ResultSet> {
    let sql: string;
    let args: BindParameters; // Array<unknown> | Record<string, unknown>;

    if (typeof stmt === "string") {
        sql = stmt;
        args = [];
    } else {
        sql = stmt.sql;
        if (Array.isArray(stmt.args)) {
            args = stmt.args.map(valueToSql);
        } else {
            args = {};
            for (const name in stmt.args) {
                args[name] = valueToSql(stmt.args[name]);
            }
        }
    }

    const sqlStmt = db.prepare(sql);
    try {
        // make safe for integers
        // https://github.com/signalapp/better-sqlite3/blob/better-sqlcipher/docs/integer.md
        // https://deno.land/x/sqlite3@0.3.0/src/database.ts?source=#L418

        let returnsData = true;
        // NOTE if raw() then don't return data
        // Causes the prepared statement to return rows as arrays instead of objects
        // https://github.com/libsql/libsql-client-ts/blob/main/src/sqlite3.ts#L214-L219
        if (returnsData) {
            const columns = sqlStmt.columnNames();
            const rows = sqlStmt.all(args).map((sqlRow) => {
                return rowFromSql(Object.values(sqlRow), columns, intMode);
            });

            // https://github.com/libsql/libsql-client-ts/blob/main/src/sqlite3.ts#L226
            const rowsAffected = db.totalChanges;
            const lastInsertRowid = BigInt(db.lastInsertRowId);

            return new ResultSetImpl(
                columns,
                rows,
                rowsAffected,
                lastInsertRowid
            );
        } else {
            const info = sqlStmt.run(args);

            const rowsAffected = info;
            const lastInsertRowid = undefined; //BigInt(info.lastInsertRowid);

            return new ResultSetImpl([], [], rowsAffected, lastInsertRowid);
        }
    } catch (e) {
        throw mapSqliteError(e);
    } finally {
        sqlStmt.finalize();
    }
}

function rowFromSql(
    sqlRow: Array<unknown>,
    columns: Array<string>,
    intMode: IntMode
): Row {
    const row = {};
    // make sure that the "length" property is not enumerable
    Object.defineProperty(row, "length", { value: sqlRow.length });
    for (let i = 0; i < sqlRow.length; ++i) {
        const value = valueFromSql(sqlRow[i], intMode);
        Object.defineProperty(row, i, { value });

        const column = columns[i];
        if (!Object.hasOwn(row, column)) {
            Object.defineProperty(row, column, { value, enumerable: true });
        }
    }
    return row as Row;
}

function valueFromSql(sqlValue: unknown, intMode: IntMode): Value {
    if (typeof sqlValue === "bigint") {
        if (intMode === "number") {
            if (sqlValue < minSafeBigint || sqlValue > maxSafeBigint) {
                throw new RangeError(
                    "Received integer which cannot be safely represented as a JavaScript number"
                );
            }
            return Number(sqlValue);
        } else if (intMode === "bigint") {
            return sqlValue;
        } else if (intMode === "string") {
            return "" + sqlValue;
        } else {
            throw new Error("Invalid value for IntMode");
        }
    } else if (/* sqlValue instanceof Object && */ sqlValue instanceof Buffer) {
        return sqlValue.buffer;
    }
    return sqlValue as Value;
}

const minSafeBigint = -9007199254740991n;
const maxSafeBigint = 9007199254740991n;

function valueToSql(value: InValue): BindValue {
    if (typeof value === "number") {
        if (!Number.isFinite(value)) {
            throw new RangeError(
                "Only finite numbers (not Infinity or NaN) can be passed as arguments"
            );
        }
        return value;
    } else if (typeof value === "bigint") {
        if (value < minInteger || value > maxInteger) {
            throw new RangeError(
                "bigint is too large to be represented as a 64-bit integer and passed as argument"
            );
        }
        return value;
    } else if (typeof value === "boolean") {
        return value ? 1 : 0;
    } else if (value instanceof ArrayBuffer) {
        return Buffer.from(value);
    } else if (value instanceof Date) {
        return value.valueOf();
    } else if (value === undefined) {
        throw new TypeError(
            "undefined cannot be passed as argument to the database"
        );
    } else {
        return value;
    }
}

const minInteger = -9223372036854775808n;
const maxInteger = 9223372036854775807n;

function executeMultiple(db: Database, sql: string): void {
    try {
        db.exec(sql);
    } catch (e) {
        throw mapSqliteError(e);
    }
}

function mapSqliteError(e: unknown): unknown {
    if (e instanceof SqliteError) {
        return new LibsqlError(e.message, "Unknown", e);
    }
    return e;
}

// **********************************************

export class ResultSetImpl implements ResultSet {
    columns: Array<string>;
    rows: Array<Row>;
    rowsAffected: number;
    lastInsertRowid: bigint | undefined;

    constructor(
        columns: Array<string>,
        rows: Array<Row>,
        rowsAffected: number,
        lastInsertRowid: bigint | undefined
    ) {
        this.columns = columns;
        this.rows = rows;
        this.rowsAffected = rowsAffected;
        this.lastInsertRowid = lastInsertRowid;
    }

    // deno-lint-ignore no-explicit-any
    toJSON(): any {
        return {
            columns: this.columns,
            rows: this.rows.map(rowToJson),
            rowsAffected: this.rowsAffected,
            lastInsertRowid:
                this.lastInsertRowid !== undefined
                    ? "" + this.lastInsertRowid
                    : null,
        };
    }
}

function rowToJson(row: Row): unknown {
    return Array.prototype.map.call(row, valueToJson);
}

function valueToJson(value: Value): unknown {
    if (typeof value === "bigint") {
        return "" + value;
    } else if (value instanceof ArrayBuffer) {
        return encode(new Uint8Array(value));
    } else {
        return value;
    }
}

// **********************************************

export function transactionModeToBegin(mode: TransactionMode): string {
    if (mode === "write") {
        return "BEGIN IMMEDIATE";
    } else if (mode === "read") {
        return "BEGIN TRANSACTION READONLY";
    } else if (mode === "deferred") {
        return "BEGIN DEFERRED";
    } else {
        throw RangeError(
            'Unknown transaction mode, supported values are "write", "read" and "deferred"'
        );
    }
}
