type Id = "id";

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
