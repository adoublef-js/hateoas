import { ResultSet, Row, Value, TransactionMode, encode } from "dev_deps";

export const supportedUrlLink =
    "https://github.com/libsql/libsql-client-ts#supported-urls";

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
    console.log(value);
    if (typeof value === "bigint") {
        return value.toString();
    } else if (value instanceof ArrayBuffer) {
        return encode(new Uint8Array(value));
    } else {
        return value;
    }
}

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
