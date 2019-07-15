import { startServer, Config } from 'maishu-node-mvc';
import path = require('path');
import { setConnection } from './settings';
import { ConnectionConfig } from 'mysql';
import { initDatabase } from './dataContext';
import { checkPath } from './filters/checkPath';
export { AuthDataContext } from "./dataContext";

interface Options {
    port: number,
    db: ConnectionConfig,
    proxy: Config['proxy']
}

export async function start(options: Options) {

    setConnection(options.db);

    await initDatabase();

    startServer({
        port: options.port, rootPath: __dirname,
        controllerDirectory: path.join(__dirname, 'controllers'),
        staticRootDirectory: path.join(__dirname, '../../out/client'),
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*'
        },
        actionFilters: [
            checkPath
        ]
    })
}
