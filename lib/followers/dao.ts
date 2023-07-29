type Id = "id";

/**
 * ```sql
 * CREATE TABLE follow (
 *      from TEXT,
 *      to TEXT,
 *      primary key (from, to)
 * );
 * ```
 */
type Follow = {
    from: string;
    to: string;
};

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

/**
 * ```sql
 * CREATE TABLE media (
 *      media_id TEXT,
 *      service TEXT,
 *      media_url TEXT,
 *      primary key (media_id)
 * );
 * ```
 */
type Media = {
    id: Id;
    service: string;
    mediaUrl: string;
};
