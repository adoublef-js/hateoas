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

function withClient(
    f: (c: Client) => Promise<void>,
    extraConfig: Partial<Config> = {}
): () => Promise<void> {
    return async () => {
        // TODO
        const c = createClient({ url: "__url__", ...extraConfig });
        try {
            await f(c);
        } finally {
            c.close();
        }
    };
}

function createClient(config: Config): Client {
    // TODO
    const path = ":memory:"; //config.
    const options = {};
    return new Sqlite3Client(path, options, config.intMode!);
}

// https://github.com/libsql/libsql-client-ts/blob/main/src/__tests__/client.test.ts
Deno.test("Sqlite3Client()", async (test) => {
    await test.step("execute()", async (test) => {
        await test.step(
            "should connect to database",
            withClient(async (c) => {})
        );
    });
});

// function createClient({}) {

// }

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
    // TODO
    executeMultiple(sql: string): Promise<void> {
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

    try {
        const sqlStmt = db.prepareQuery(sql);
        // make safe for integers
        let returnsData = true;
        // NOTE if raw() then don't return data
        // https://github.com/libsql/libsql-client-ts/blob/main/src/sqlite3.ts#L214-L219
        if (returnsData) {
            const columns = sqlStmt.columns().map((col) => col.name);

            //  export type QueryParameterSet =
            //   | Record<string, QueryParameter>
            //   | Array<QueryParameter>;

            const rows = sqlStmt.all(args).map((sqlRow) => {
                return rowFromSql(sqlRow as Array<unknown>, columns, intMode);
            });
            // https://github.com/libsql/libsql-client-ts/blob/main/src/sqlite3.ts#L226
            const rowsAffected = 0;
            const lastInsertRowid = undefined;
            // rs.columns == [ 'uid', 'email' ]
            // rs.rows[0] == [ 'uid1', 'foo@bar.com' ]
            // rs.rows[1] == [ 'uid2', 'baz@bar.com' ]
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
    } else if (sqlValue instanceof Buffer) {
        return sqlValue.buffer;
    }
    return sqlValue as Value;
}

const minSafeBigint = -9007199254740991n;
const maxSafeBigint = 9007199254740991n;

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
