export enum Code {
    NotFound = 10001,
    DuplicateEntry = 10002,
    SnapshotTooOld = 10003,
    InternalError = 11001,
}

export type ErrorCode =
    | Code.NotFound
    | Code.DuplicateEntry
    | Code.SnapshotTooOld
    | Code.InternalError;

export const CODE_TEXT: Readonly<Record<Code, string>> = {
    [Code.NotFound]: "Not Found",
    [Code.DuplicateEntry]: "Duplicate Entry",
    [Code.SnapshotTooOld]: "Snapshot Too Old",
    [Code.InternalError]: "Internal Error",
};
