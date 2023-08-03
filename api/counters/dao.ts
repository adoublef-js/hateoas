import { LibSqlClient } from "deps";

export async function getCount(
    c: LibSqlClient,
    value: number
): Promise<number> {
    const rs = await c.execute({
        sql: "SELECT ?",
        args: [value],
    });

    return Number(rs.rows[0][0]);
}
