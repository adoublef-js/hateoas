import { Config, Client } from "https://esm.sh/@libsql/client@0.3.1";
import { _createClient as _createWebClient } from "https://esm.sh/@libsql/client@0.3.1/web";
import { _createClient as _createSqlite3Client } from "lib/libsql/denodrivers/client.ts";
import {
    expandConfig,
    ExpandedConfig,
} from "https://esm.sh/@libsql/client@0.3.1/lib-esm/config.js";

export function createClient(config: Config): Client {
    return _createClient(expandConfig(config, true));
}

/** @private */
function _createClient(config: ExpandedConfig) {
    if (config.scheme === "file") {
        return _createSqlite3Client(config);
    }

    return _createWebClient(config);
}