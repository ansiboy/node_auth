import { errors } from './errors';
import * as settings from './settings';
import * as mysql from 'mysql';
import * as cache from 'memory-cache';
import { createDataContext } from './data-context';
import { Token } from './entities';
import { guid } from './utility';

const tableName = 'token';

type MyToken = Token & { cacheDateTime?: number };

function mongoObjectId(): string {
    var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

function execute<T>(callback: (collection: mysql.Connection) => Promise<T>): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
        let conn = mysql.createConnection(settings.conn.auth);
        callback(conn)
            .then((result) => {
                conn.end();
                resolve(result);
            })
            .catch(err => {
                conn.end();
                reject(err);
            });
    });
}

function query(conn: mysql.Connection, sql: string, value?: any): Promise<[any[], mysql.FieldInfo[]]> {
    return new Promise((resolve, reject) => {
        conn.query(sql, value, (err, rows, fields) => {
            if (err) {
                reject(err);
                return;
            }

            resolve([rows, fields]);
        })
    });
}

/**
 * 用于解释和生成 token 。
 */
export class TokenManager {
    // id?: string;
    // content: string;
    // contentType: string;
    // createDateTime: Date;
    // cacheDateTime: number;

    //application/json")
    static async create(content: object): Promise<Token>
    static async create(content: string, contentType: string): Promise<Token>
    static async create(content: string | object, contentType?: string): Promise<Token> {
        let token = new Token();

        if (typeof content == 'object') {
            content = JSON.stringify(content)
            contentType = 'application/json'
        }

        token.id = guid();
        token.content = content;
        token.content_type = contentType;
        token.create_date_time = new Date(Date.now());

        let dc = await createDataContext();
        try {
            await dc.tokens.save(token);
            return token;
        }
        finally {
            dc.dispose();
        }
    }

    /**
     * 对令牌字符串进行解释，转换为令牌对象
     * @param appId 应用ID
     * @tokenValue 令牌字符串
     */
    static async parse(tokenValue: string): Promise<Token> {

        if (!tokenValue)
            return Promise.reject(errors.argumentNull('tokenValue'));

        let token: MyToken = cache.get(tokenValue);

        if (token == null) {
            token = await execute(async (conn) => {
                let sql = `select * from ${tableName} where id = ?`;
                let [rows, fields] = await query(conn, sql, tokenValue);
                return rows[0];
            })

            if (token != null) {
                token.cacheDateTime = Date.now();
                cache.put(tokenValue, token);
            }
        }

        return token;
    }

    static async remove(id: string) {
        let dc = await createDataContext();
        try {
            await dc.tokens.delete({ id });
        }
        finally {
            dc.dispose();
        }
    }
}

setInterval(() => {

    let keys = cache.keys() || [];
    for (let i = 0; i < keys.length; i++) {
        let token: MyToken = cache.get(keys[i]);
        if (token == null) {
            cache.del(keys[i]);
            continue;
        }

        console.assert(token != null);
        let interval = Date.now() - (token.cacheDateTime || 0);
        let hour = 1000 * 60 * 60;
        if (interval > hour * 2) {
            cache.del(keys[i]);
        }
    }

}, 1000 * 60 * 60); 