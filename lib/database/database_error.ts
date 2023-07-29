import { CODE_TEXT, Code, ErrorCode } from "lib/database/database_code.ts";

const ERROR_CODE_MAP = {
    NotFound: 10001,
    DuplicateEntry: 10002,
    SnapshotTooOld: 10003,
    InternalError: 11001,
} as const;

export type ErrorCodeKeys = keyof typeof ERROR_CODE_MAP;

export interface DatabaseErrorOptions extends ErrorOptions {
    // TODO
}

export class DatabaseError extends Error {
    #code: ErrorCode = Code.InternalError;
    constructor(message = "Database Error", options?: DatabaseErrorOptions) {
        super(message, options);
    }
    get code(): ErrorCode {
        return this.#code;
    }
}

function createDatabaseErrorCondtructor(code: ErrorCode): typeof DatabaseError {
    const name = `${Code[code]}Error`;
    const ErrorCtor = class extends DatabaseError {
        constructor(message = CODE_TEXT[code], options?: DatabaseErrorOptions) {
            super(message, options);
            Object.defineProperty(this, "name", {
                configurable: true,
                enumerable: false,
                value: name,
                writable: true,
            });
        }
        override get code() {
            return code;
        }
    };

    return ErrorCtor;
}

export const errors: Record<ErrorCodeKeys, typeof DatabaseError> = {} as Record<
    ErrorCodeKeys,
    typeof DatabaseError
>;

for (const [key, value] of Object.entries(ERROR_CODE_MAP)) {
    errors[key as ErrorCodeKeys] = createDatabaseErrorCondtructor(value);
}

export function createDatabaseError(
    code: ErrorCode = Code.InternalError,
    message?: string,
    options?: DatabaseErrorOptions
): DatabaseError {
    return new errors[Code[code] as ErrorCodeKeys](message, options);
}

export function isDatabaseError(value: unknown): value is DatabaseError {
    return value instanceof DatabaseError;
}

export function panic(
    errorCode: ErrorCode,
    message?: string,
    props?: Record<string, unknown>
): never {
    const error = createDatabaseError(errorCode, message);
    if (props) {
        Object.assign(error, props);
    }
    throw error;
}
