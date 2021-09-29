export function isErr(obj: unknown): obj is Error {
    if (typeof obj !== 'object') return false;
    return !!obj && 'message' in obj;
}
