import { LibSqlClient } from "deps";
import { Id as Cuid } from "lib/id/cuid_2.ts";

type Row = {
    id: string; //Cuid;
    user: string;
};

export class People {
    constructor(private readonly rwc: LibSqlClient) {}

    // find/get
    // list
    // add/insert/set
    // remove
}

export async function getProfile(c: LibSqlClient, { user }: { user: string }) {
    const rs = await c.execute({
        sql: "SELECT * from people WHERE user = ?",
        args: [user],
    });

    if (!rs.rows[0]) {
        return undefined;
    }

    return rs.rows[0] as unknown as Row; //should be the the Profile object
}

export async function setProfile(
    c: LibSqlClient,
    { user, id = new Cuid() }: { id?: Cuid; user: string }
) {
    // FIXME user must be unique so catch error if this fails
    await c.execute({
        sql: "INSERT INTO people (id, user) VALUES (?, ?);",
        args: [id.toString(), user],
    });

    return id;
}
