const config = require('./config.json')
const path = require('path')
const http = require('http')
const { start } = require('./out/index')
const { constants } = require("./out/common");
const { TokenManager } = require("./out/token");
const Cookies = require("cookies")
    //===========================================
    // 目标主机，服务所在的主机
const target_host = '127.0.0.1';
//===========================================

start({
    port: config.port,
    // bindIP: "127.0.0.1",
    db: {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.name
    },
    virtualPaths: {
        node_modules: path.join(__dirname, "node_modules"),
    },
    proxy: {
        '/AdminSite/(\\S+)': { targetUrl: `http://${target_host}:9000/Admin/$1`, headers: proxyHeader },
        '/AdminStock/(\\S+)': { targetUrl: `http://${target_host}:9005/Admin/$1`, headers: proxyHeader },
        '/AdminShop/(\\S+)': { targetUrl: `http://${target_host}:9010/Admin/$1`, headers: proxyHeader },
        '/AdminMember/(\\S+)': { targetUrl: `http://${target_host}:9020/Admin/$1`, headers: proxyHeader },
        '/AdminWeiXin/(\\S+)': { targetUrl: `http://${target_host}:9030/Admin/$1`, headers: proxyHeader },
        '/AdminAccount/(\\S+)': { targetUrl: `http://${target_host}:9035/Admin/$1`, headers: proxyHeader },
        '/UserSite/(\\S+)': { targetUrl: `http://${target_host}:9000/User/$1`, headers: proxyHeader },
        '/UserStock/(\\S+)': { targetUrl: `http://${target_host}:9005/User/$1`, headers: proxyHeader },
        '/UserShop/(\\S+)': { targetUrl: `http://${target_host}:9010/User/$1`, headers: proxyHeader },
        '/UserMember/(\\S+)': { targetUrl: `http://${target_host}:9020/User/$1`, headers: proxyHeader },
        '/UserWeiXin/(\\S+)': { targetUrl: `http://${target_host}:9030/User/$1`, headers: proxyHeader },
        '/UserAccount/(\\S+)': { targetUrl: `http://${target_host}:9035/User/$1`, headers: proxyHeader },
        "^/Images/Editor/(\\S+)": "http://web.alinq.cn/store2/Images/Editor/$1",
        "/merchant(\\S*)": `http://127.0.0.1:65271$1`,
        "/image(\\S*)": `http://127.0.0.1:48628$1`
    },
    async initDatabase() {
        // await dc.initDatabase("18502146746", "b6d767d2f8ed5d21a44b0e5886680cb9")
    },
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    },
    permissions: {
        "*.js": [constants.anonymousRoleId],
        "*.html": [constants.anonymousRoleId],
        "*.css": [constants.anonymousRoleId],
        "*.less": [constants.anonymousRoleId],
        "*.jpg": [constants.anonymousRoleId],
        "*.png": [constants.anonymousRoleId],
        "*.woff": [constants.anonymousRoleId],
        "*.map": [constants.anonymousRoleId],

        "/admin/*": [constants.anonymousRoleId],
        "/user/*": [constants.anonymousRoleId],
        "/designer/*": [constants.anonymousRoleId],
        "/shop/*": [constants.anonymousRoleId],
        "/chitu-admin/*": [constants.anonymousRoleId],
        "/auth/*": [constants.anonymousRoleId],
        "/UserMember/*": [constants.anonymousRoleId],
        "/UserShop/*": [constants.anonymousRoleId],
        "/Images/*": [constants.anonymousRoleId],
        "/merchant*": [constants.anonymousRoleId],
    }
})


/**
 * 
 * @param {http.IncomingMessage} req 
 */
async function proxyHeader(req) {
    let cookies = new Cookies(req);
    let header = {}
    let tokenText = req.headers['token'] || cookies.get("token");
    if (tokenText) {
        try {
            let token = await TokenManager.parse(tokenText);
            var obj = JSON.parse(token.content);
            header = obj
        } catch (err) {
            console.error(err)
        }
    }

    if (header.user_id) {
        header['SellerId'] = header.user_id
        header['UserId'] = header.user_id
    }

    return header
}

// startWeb({
//     port: config.port + 1,
//     roleId: config.roleId,
//     gateway: `127.0.0.1:${config.port}`,
//     controllerPath: path.join(__dirname, 'out/server/controllers'),
//     // staticRootDirectory: path.join(__dirname, "out/public"),
// })

// console.log(`web: http://127.0.0.1:${config.port + 1}`)