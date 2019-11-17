let gatewayStationSettings = {
    "port": 2857,
    "db": {
        "user": "root",
        "password": "81263",
        "database": "haoyi_shop_auth",
        "host": "localhost",
        "port": 3306
    }
}

let permissionStationSettings = {
    port: gatewayStationSettings.port + 100,
    db: {
        "user": "root",
        "password": "81263",
        "database": "node-auth-permission",
        "host": "localhost",
        "port": 3306
    }
}


const path = require('path');
const http = require('http');

let { start: startGateway, roleIds } = require("./gateway/index");
require("./portal/index");
let { start: startPermission } = require("./permission/index");

//===========================================
// 目标主机，服务所在的主机
const target_host = '127.0.0.1';
//===========================================



startGateway({
    port: gatewayStationSettings.port,
    logLevel: "all",
    db: gatewayStationSettings.db,
    proxy: {
        '/AdminSite/(\\S+)': `http://${target_host}:9000/Admin/$1`,
        '/AdminStock/(\\S+)': `http://${target_host}:9005/Admin/$1`,
        '/AdminShop/(\\S+)': `http://${target_host}:9010/Admin/$1`,
        '/AdminMember/(\\S+)': `http://${target_host}:9020/Admin/$1`,
        '/AdminWeiXin/(\\S+)': `http://${target_host}:9030/Admin/$1`,
        '/AdminAccount/(\\S+)': `http://${target_host}:9035/Admin/$1`,
        '/UserSite/(\\S+)': `http://${target_host}:9000/User/$1`,
        '/UserStock/(\\S+)': `http://${target_host}:9005/User/$1`,
        '/UserShop/(\\S+)': `http://${target_host}:9010/User/$1`,
        '/UserMember/(\\S+)': `http://${target_host}:9020/User/$1`,
        '/UserWeiXin/(\\S+)': `http://${target_host}:9030/User/$1`,
        '/UserAccount/(\\S+)': `http://${target_host}:9035/User/$1`,
        "^/Images/Editor/(\\S+)": "http://web.alinq.cn/store2/Images/Editor/$1",
        "/merchant(\\S*)": `http://127.0.0.1:65271/$1`,
        "/image/(\\S*)": `http://127.0.0.1:48628/$1`
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
        "/": { roleIds: [roleIds.anonymousRoleId] },
        "/socket.io/*": { roleIds: [roleIds.anonymousRoleId] },
        "/socket*": { roleIds: [roleIds.anonymousRoleId] },
        "*.js": { roleIds: [roleIds.anonymousRoleId] },
        "*.html": { roleIds: [roleIds.anonymousRoleId] },
        "*.css": { roleIds: [roleIds.anonymousRoleId] },
        "*.less": { roleIds: [roleIds.anonymousRoleId] },
        "*.jpg": { roleIds: [roleIds.anonymousRoleId] },
        "*.png": { roleIds: [roleIds.anonymousRoleId] },
        "*.woff": { roleIds: [roleIds.anonymousRoleId] },
        "*.map": { roleIds: [roleIds.anonymousRoleId] },

        // "/admin/(*)": { roleIds: [constants.anonymousRoleId] },
        // "/user/*": { roleIds: [constants.anonymousRoleId] },
        // "/designer/*": { roleIds: [constants.anonymousRoleId] },
        // "/shop/*": { roleIds: [constants.anonymousRoleId] },
        // "/chitu-admin/*": { roleIds: [constants.anonymousRoleId] },
        // "/auth/*": { roleIds: [constants.anonymousRoleId] },
        // "/UserMember/*": { roleIds: [constants.anonymousRoleId] },
        // "/UserShop/*": { roleIds: [constants.anonymousRoleId] },
        // "/Images/*": { roleIds: [constants.anonymousRoleId] },
        // "/merchant*": { roleIds: [constants.anonymousRoleId] },
        "/favicon.ico": { roleIds: [roleIds.anonymousRoleId] },
        "/auth/user/login": { roleIds: [roleIds.anonymousRoleId] },

        "/auth/station/list": { roleIds: [roleIds.anonymousRoleId] },
        "/auth/station/register": { roleIds: [roleIds.anonymousRoleId] },

        "/AdminMember/*": { roleIds: [roleIds.adminRoleId] },
        "/UserMember/*": { roleIds: [roleIds.adminRoleId] },
        "/portal/*": { roleIds: [roleIds.anonymousRoleId] }
    },
    actionFilters: [(req, res) => {
        console.log(res.statusCode);
        let write = res.write;
        res.write = function (arg1, arg2, arg3) {
            console.log(res.statusCode);
            console.log(arg1.toString());
            return write.apply(this, [arg1, arg2, arg3]);
        }
    }]
})


startPermission({
    port: permissionStationSettings.port,
    db: permissionStationSettings.db
})

