type Id = "id";

/**
 * ```sql
 * CREATE TABLE profile (
 *      profile_id TEXT,
 *      user_id TEXT,
 *      full_name TEXT,
 *      image_url TEXT,
 *      primary key (profile, user_id)
 * );
 * ```
 */
type Profile = {
    id: Id;
    user: string;
    fullName: string;
    imageUrl: string | undefined;
};
