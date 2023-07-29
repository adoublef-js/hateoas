export enum Code {
    InvalidSchema = 11001,
}

export type ErrorCode = Code.InvalidSchema;

export const CODE_TEXT: Readonly<Record<Code, string>> = {
    [Code.InvalidSchema]: "Invalid Schema",
};
