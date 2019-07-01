"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database");
const errors_1 = require("../errors");
// import { Connection, list, get, execute as executeSQL } from "maishu-mysql-helper";
const maishu_node_mvc_1 = require("maishu-node-mvc");
const mysql = require("mysql");
const decorators_1 = require("../decorators");
const dataContext_1 = require("../dataContext");
let RoleController = class RoleController {
    add(dc, appId, { item }) {
        if (!item)
            throw errors_1.errors.argumentNull('item');
        if (!item.name)
            throw errors_1.errors.fieldNull("name", "item");
        let role = {
            id: database_1.guid(), name: item.name, remark: item.remark,
            category: item.category,
            create_date_time: new Date(Date.now()),
            application_id: appId
        };
        if (appId)
            role.application_id = appId;
        dc.roles.save(role);
        return { id: role.id };
    }
    update({ id, name, remark }) {
        return database_1.connect((conn) => __awaiter(this, void 0, void 0, function* () {
            let sql = `update role set ? where id = ?`;
            let role = { name, remark };
            yield database_1.execute(conn, sql, [role, id]);
            return role;
        }));
    }
    remove(dc, appId, { id }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw errors_1.errors.argumentNull('id');
            yield dc.roles.delete({ id });
            return { id };
        });
    }
    /** 获取角色列表 */
    list(conn) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield database_1.list(conn, 'role', { sortExpression: 'create_date_time asc' });
            return result.dataItems;
        });
    }
    /** 获取单个角色 */
    get(dc, { id }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw errors_1.errors.argumentNull('id');
            if (!dc)
                throw errors_1.errors.argumentNull('dc');
            // let r = await get(conn, 'role', { id })
            // return r
            let r = yield dc.roles.findOne(id);
            return r;
        });
    }
    /**
     * 设置角色所允许访问的资源
     * @param param0 参数
     * roleId 角色 ID
     * resourceIds 角色所允许访问的资源 ID 数组
     * appId 应用 ID
     */
    setResources(conn, { roleId, resourceIds }) {
        return __awaiter(this, void 0, void 0, function* () {
            // return connect(async conn => {
            let sql = `select * from role_resource where role_id = ?`;
            let [rows] = yield database_1.execute(conn, sql, roleId);
            let roleResources = rows;
            let existsResourceIds = roleResources.map(o => o.resource_id);
            let removeResourceIds = new Array();
            let addResourceIds = new Array();
            existsResourceIds.forEach(resource_id => {
                if (resourceIds.indexOf(resource_id) < 0) {
                    removeResourceIds.push(resource_id);
                }
            });
            resourceIds.forEach(resourceId => {
                if (existsResourceIds.indexOf(resourceId) < 0)
                    addResourceIds.push(resourceId);
            });
            if (removeResourceIds.length > 0) {
                sql = `delete from role_resource where role_id = ? and (`;
                for (let i = 0; i < removeResourceIds.length; i++) {
                    if (i == 0)
                        sql = sql + `resource_id = ?`;
                    else
                        sql = sql + ` or resource_id = ?`;
                }
                sql = sql + ')';
                yield database_1.execute(conn, sql, [roleId, ...removeResourceIds]);
            }
            if (addResourceIds.length > 0) {
                sql = `insert into role_resource (resource_id, role_id, create_date_time) values `;
                let values = new Array();
                for (let i = 0; i < addResourceIds.length; i++) {
                    if (i == 0) {
                        sql = sql + '(?, ?, ?)';
                    }
                    else {
                        sql = sql + ',(?, ?, ?)';
                    }
                    values.push(...[addResourceIds[i], roleId, new Date(Date.now())]);
                }
                yield database_1.execute(conn, sql, values);
            }
            return {};
            // })
        });
    }
    /**
     * 获取角色的资源编号
     * @param param0
     * roleId: 角色编号
     */
    resourceIds({ roleId }) {
        if (!roleId)
            throw errors_1.errors.argumentNull('roleId');
        return database_1.connect((conn) => __awaiter(this, void 0, void 0, function* () {
            let sql = `select resource_id from role_resource where role_id = ?`;
            let [rows] = yield database_1.execute(conn, sql, [roleId]);
            return rows.map(o => o.resource_id);
        }));
    }
    /**
     * 获取用户角色编号
     */
    userRoles(conn, { userIds }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userIds == null)
                throw errors_1.errors.argumentNull('userIds');
            if (conn == null)
                throw errors_1.errors.argumentNull('conn');
            let items = {};
            if (userIds.length > 0) {
                let str = userIds.map(o => `"${o}"`).join(',');
                let sql = `select * from user_role left join role on user_role.role_id = role.id where user_role.user_id in (${str})`;
                let rows = yield database_1.executeSQL(conn, sql, null);
                for (let i = 0; i < userIds.length; i++) {
                    items[userIds[i]] = rows.filter(o => o.user_id == userIds[i]);
                }
            }
            return items;
        });
    }
};
__decorate([
    maishu_node_mvc_1.action(),
    __param(0, dataContext_1.authDataContext), __param(1, decorators_1.ApplicationId), __param(2, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dataContext_1.AuthDataContext, String, Object]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "add", null);
__decorate([
    maishu_node_mvc_1.action(),
    __param(0, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoleController.prototype, "update", null);
__decorate([
    maishu_node_mvc_1.action(),
    __param(0, dataContext_1.authDataContext), __param(1, decorators_1.ApplicationId), __param(2, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dataContext_1.AuthDataContext, String, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "remove", null);
__decorate([
    maishu_node_mvc_1.action(),
    __param(0, database_1.connection),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "list", null);
__decorate([
    maishu_node_mvc_1.action("get", "item"),
    __param(0, dataContext_1.authDataContext), __param(1, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dataContext_1.AuthDataContext, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "get", null);
__decorate([
    maishu_node_mvc_1.action("setResources", "resource/set"),
    __param(0, database_1.connection), __param(1, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "setResources", null);
__decorate([
    maishu_node_mvc_1.action("resourceIds", "resource/ids"),
    __param(0, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "resourceIds", null);
__decorate([
    maishu_node_mvc_1.action(),
    __param(0, database_1.connection), __param(1, maishu_node_mvc_1.formData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "userRoles", null);
RoleController = __decorate([
    maishu_node_mvc_1.controller("role")
], RoleController);
exports.default = RoleController;
//# sourceMappingURL=role.js.map