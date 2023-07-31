import { LibSqlClient } from "deps";
import {
    _createWebClient,
    Config,
    ExpandedConfig,
    expandConfig,
} from "dev_deps";
import { _createClient as _createSqlite3Client } from "lib/libsql/denodrivers/client.ts";

export function createClient(config: Config): LibSqlClient {
    return _createClient(expandConfig(config, true));
}

/** @private */
function _createClient(config: ExpandedConfig): LibSqlClient {
    if (config.scheme === "file") {
        return _createSqlite3Client(config);
    }

    return _createWebClient(config);
}
