import {
    DB,
    QueryParameterSet,
    SqliteError,
    SqliteOptions,
} from "https://deno.land/x/sqlite@v3.7.2/mod.ts";
import { Client } from "https://esm.sh/@libsql/client@0.3.1/web";
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
} from "https://esm.sh/@libsql/client@0.3.1";
import { encode } from "https://deno.land/std@0.196.0/encoding/base64.ts";
import {
    assertEquals,
    assertObjectMatch,
    assertArrayIncludes,
} from "https://deno.land/std@0.195.0/assert/mod.ts";

function withClient(
    f: (c: Client) => Promise<void>,
    extraConfig: Partial<Config> = {}
): () => Promise<void> {
    return async () => {
        // TODO
        const c = createClient({
            url: "__url__",
            intMode: "number",
            ...extraConfig,
        });
        try {
            await f(c);
        } finally {
            c.close();
        }
    };
}

function createClient(config: Config): Client {
    // TODO
    const path = "file:memdb1?mode=memory&cache=shared"; // https://www.sqlite.org/inmemorydb.html
    const options = {};
    return new Sqlite3Client(path, options, config.intMode!);
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
});

export class Sqlite3Client implements Client {
    #path: string;
    #options: SqliteOptions;
    #intMode: IntMode;
    closed: boolean;
    protocol: "file";

    constructor(path: string, options: SqliteOptions, intMode: IntMode) {
        this.#path = path;
        this.#options = options;
        this.#intMode = intMode;
        this.closed = false;
        this.protocol = "file";
    }

    async execute(stmt: InStatement): Promise<ResultSet> {
        this.#checkNotClosed();
        const db = new DB(this.#path, this.#options);
        try {
            return await executeStmt(db, stmt, this.#intMode);
        } finally {
            db.close();
        }
    }

    async executeMultiple(sql: string): Promise<void> {
        this.#checkNotClosed();
        const db = new DB(this.#path, this.#options);
        try {
            return await executeMultiple(db, sql);
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

    // TODO
    batch(
        stmts: InStatement[],
        mode?: TransactionMode | undefined
    ): Promise<ResultSet[]> {
        throw new Error("Method not implemented.");
    }
    // TODO
    transaction(mode?: TransactionMode | undefined): Promise<Transaction>;
    transaction(): Promise<Transaction>;
    transaction(
        mode?: unknown
    ): Promise<import("https://esm.sh/@libsql/client@0.3.1/web").Transaction> {
        throw new Error("Method not implemented.");
    }
}

async function executeStmt(
    db: DB,
    stmt: InStatement,
    intMode: IntMode
): Promise<ResultSet> {
    let sql: string;
    // let args: ;
    let args: QueryParameterSet; //Array<unknown> | Record<string, unknown>;
    if (typeof stmt === "string") {
        sql = stmt;
        args = [];
    } else {
        sql = stmt.sql;
        if (Array.isArray(stmt.args)) {
            // append args here
            args = [];
        } else {
            args = {};
            // append args here
        }
    }

    // https://esm.sh/gh/libsql/libsql-client-ts/src/util.ts

    const sqlStmt = db.prepareQuery(sql);
    try {
        // make safe for integers
        let returnsData = true;
        // NOTE if raw() then don't return data
        // https://github.com/libsql/libsql-client-ts/blob/main/src/sqlite3.ts#L214-L219
        if (returnsData) {
            const columns = sqlStmt.columns().map((col) => col.name);
            const rows = sqlStmt.all(args).map((sqlRow) => {
                return rowFromSql(sqlRow as Array<unknown>, columns, intMode);
            });

            // https://github.com/libsql/libsql-client-ts/blob/main/src/sqlite3.ts#L226
            // rs.columns == [ 'uid', 'email' ]
            // rs.rows[0] == [ 'uid1', 'foo@bar.com' ]
            // rs.rows[1] == [ 'uid2', 'baz@bar.com' ]
            const rowsAffected = 0;
            const lastInsertRowid = undefined;
            return new ResultSetImpl(
                columns,
                rows,
                rowsAffected,
                lastInsertRowid
            );
        } else {
            // const info = sqlStmt.run(args);

            const rowsAffected = 0; //info.changes;
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
    } else if (sqlValue instanceof Object && sqlValue instanceof Buffer) {
        return sqlValue.buffer;
    }
    return sqlValue as Value;
}

const minSafeBigint = -9007199254740991n;
const maxSafeBigint = 9007199254740991n;

function executeMultiple(db: DB, sql: string): void {
    try {
        db.execute(sql);
    } catch (e) {
        throw mapSqliteError(e);
    }
}

function mapSqliteError(e: unknown): unknown {
    if (e instanceof SqliteError) {
        return new LibsqlError(e.message, e.codeName, e);
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
