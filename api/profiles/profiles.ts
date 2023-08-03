import { Id } from "lib/id/ulid.ts";

export type Profile = {
    id: Id;
    /** The unique identifier linked to the user's oauth credentials */
    user: string;
};
