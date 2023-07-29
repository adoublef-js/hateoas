import { CODE_TEXT, Code, ErrorCode } from "lib/parse/parse_code.ts";

const ERROR_CODE_MAP = {
    InvalidSchema: 11001,
} as const;

export type ErrorCodeKeys = keyof typeof ERROR_CODE_MAP;

export interface ParseErrorOptions extends ErrorOptions {
    // TODO
}

export class ParseError extends Error {
    #code: ErrorCode = Code.InvalidSchema;
    constructor(message = "Parse Error", options?: ParseErrorOptions) {
        super(message, options);
    }
    get code(): ErrorCode {
        return this.#code;
    }
}

function createParserErrorCondtructor(code: ErrorCode): typeof ParseError {
    const name = `${Code[code]}Error`;
    const ErrorCtor = class extends ParseError {
        constructor(message = CODE_TEXT[code], options?: ParseErrorOptions) {
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

export const errors: Record<ErrorCodeKeys, typeof ParseError> = {} as Record<
    ErrorCodeKeys,
    typeof ParseError
>;

for (const [key, value] of Object.entries(ERROR_CODE_MAP)) {
    errors[key as ErrorCodeKeys] = createParserErrorCondtructor(value);
}

export function createParserError(
    code: ErrorCode = Code.InvalidSchema,
    message?: string
): ParseError {
    return new errors[Code[code] as ErrorCodeKeys](message);
}

export function isParseError(value: unknown): value is ParseError {
    return value instanceof ParseError;
}

export function panic(
    errorCode: ErrorCode,
    message?: string,
    props?: Record<string, unknown>
): never {
    const error = createParserError(errorCode, message);
    if (props) {
        Object.assign(error, props);
    }
    throw error;
}
