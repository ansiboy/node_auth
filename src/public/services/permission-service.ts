import { DataSourceSelectResult, DataSourceSelectArguments } from "maishu-wuzhui"
import { errors } from '../errors'
import { PermissionService as Service, User, MenuItem, ResourceType, Resource, Role } from 'maishu-services-sdk'
import { alert } from "maishu-ui-toolkit";
import { Category } from "../../../out/server/entities"

export type Admin = User & { role_ids: string[] }




let menuItems: MenuItem[]



export class PermissionService extends Service {
    private roleResourceIds: { [roleId: string]: string[] } = {}

    constructor() {
        super()
    }
    role = {
        list: () => {
            let url = this.url("role/list")
            return this.get<Role[]>(url);
        },
        item: (id: string) => {
            let url = this.url("role/item");
            return this.get<Role>(url);
        },
        add: (item: Partial<Role>) => {
            let url = this.url("role/add");
            return this.postByJson(url, { item })
        },
        remove: (id: string) => {
            let url = this.url("role/remove");
            return this.postByJson(url, { id });
        }
    };

    resource = {
        list: (args: DataSourceSelectArguments) => {
            let url = this.url("resource/list");
            return this.getByJson<DataSourceSelectResult<Resource>>(url, { args });
        },
        item: (id) => {
            let url = this.url("resource/item");
            return this.getByJson<Resource>(url, { id })
        },
        remove: (id) => {
            let url = this.url("resource/remove");
            return this.post(url, { id });
        },
        add: (item: Partial<Resource>) => {
            let url = this.url("resource/add");
            return this.postByJson<{ id: string }>(url, { item })
        }
    };
    menu = (() => {

        let convertToMenuItem = (resource: Resource) => {
            let o = {
                id: resource.id,
                name: resource.name,
                parent_id: resource.parent_id,
                path: resource.path,
                icon: (resource.data || {}).icon,
                sort_number: resource.sort_number,
                category: resource.category,
                create_date_time: resource.create_date_time,
            } as MenuItem;

            return o;
        }

        return {
            list: async (args: DataSourceSelectArguments) => {
                let r = await this.resource.list(args);
                let resources = r.dataItems.filter(o => o.type == 'menu');
                let menuItems = resources.map(o => convertToMenuItem(o));

                let stack: MenuItem[] = menuItems.filter(o => !o.parent_id);

                let result: MenuItem[] = [];
                while (stack.length > 0) {
                    let item = stack.shift();
                    result.push(item);

                    item.children = menuItems.filter(o => o.parent_id == item.id);

                    if (item.parent_id) {
                        item.parent = menuItems.filter(o => o.id == item.parent_id)[0];
                    }

                    console.assert(item.children)
                    if (item.children.length > 0) {
                        stack.unshift(...item.children)
                    }
                    // if (item.children.length > 0)
                    //     stack.push(...item.children)


                }

                return result;
            },
            item: async (id: string) => {
                let resource = await this.resource.item(id);
                let menuItem = convertToMenuItem(resource);
                return menuItem;
            }
        }

    })();

    /** 系统类别，例如：平台，经销商 */
    category = {
        list: async () => {
            let url = this.url("category/list");
            let r = await this.getByJson<Category[]>(url);
            return r;
        }
    }

    async resourceList(args: DataSourceSelectArguments): Promise<DataSourceSelectResult<Resource>> {
        let url = this.url('resource/list')
        if (!args.sortExpression)
            args.sortExpression = 'sort_number asc'

        type T = Resource & { data?: { visible?: boolean } }
        let result = await this.getByJson<DataSourceSelectResult<T>>(url, { args })
        for (let i = 0; i < result.dataItems.length; i++) {
            result.dataItems[i].data = result.dataItems[i].data || {}
        }

        return result
    }
    async getResources() {
        type Item = Resource & { children: Item[], selected: boolean }
        let args = new DataSourceSelectArguments()
        args.sortExpression = `sort_number asc`
        let r = await this.resourceList(args)
        let items = r.dataItems.filter(o => o.type != 'button')
            .map(o => Object.assign({
                children: r.dataItems.filter(c => c.parent_id == o.id && c.type == 'button'),
                selected: false,
            }, o))

        return items
    }
    // async deleteResource(id: string) {
    //     let url = this.url('resource/remove')
    //     return this.postByJson(url, { id })
    // }
    async getResourceChildCommands(id: string) {
        let buttonType: ResourceType = 'button'
        let filter = `parent_id = '${id}' and type = '${buttonType}'`
        let url = `resource/list`
        let result = await this.getByJson(url, { filter })
        return result
    }


    async getRoleResourceIds(roleId: string) {
        let r = this.roleResourceIds[roleId]
        if (!r) {
            r = this.roleResourceIds[roleId] = await super.getRoleResourceIds(roleId)
        }

        return r
    }
    //=============================================================
    // // 角色相关
    // getRoles(): Promise<Role[]> {
    //     let url = this.url('role/list')
    //     return this.getByJson(url)
    // }
    // /** 获取单个角色 */
    // getRole(id: string): Promise<Role> {
    //     let url = this.url('role/get')
    //     return this.getByJson(url, { id })
    // }
    // setRoleResource(roleId: string, resourceIds: string[]) {
    //     if (!roleId) throw errors.argumentNull('roleId')
    //     if (!resourceIds) throw errors.argumentNull('resourceIds')

    //     let url = this.url('role/setResources')
    //     return this.postByJson(url, { roleId, resourceIds })
    // }
    // getRoleResourceIds(roleId: string): Promise<string[]> {
    //     if (!roleId) throw errors.argumentNull('roleId')
    //     let url = this.url('role/resourceIds')
    //     return this.getByJson(url, { roleId })
    // }
    setUserRoles(userId: string, roleIds: string[]) {
        let url = this.url('user/setRoles')
        return this.postByJson(url, { userId, roleIds })
    }
    addUserRoles(userId: string, roleIds: string[]) {
        let url = this.url('user/addRoles')
        return this.postByJson(url, { userId, roleIds })
    }
    getUsersRoles(userIds: string[]) {
        let url = this.url('role/userRoles')
        return this.getByJson<{ [key: string]: Role[] }>(url, { userIds })
    }
    async getUserRoles(userId: string): Promise<Role[]> {
        let roleses = await this.getUsersRoles([userId])
        return roleses[userId]
    }
    // //================================================================
    async getUserList(args: DataSourceSelectArguments): Promise<DataSourceSelectResult<User>> {
        let r = await super.getUserList(args)
        r.dataItems.forEach(o => o.data = o.data || {})
        return r
    }
    async getUsersByIds(ids: string[]): Promise<User[]> {
        if (ids == null) throw errors.argumentNull('ids')
        if (ids.length == 0)
            return []

        let concatedIds = ids.map(o => `'${o}'`).join(',')
        let url = this.url('user/list')
        let args: DataSourceSelectArguments = {
            filter: `id in (${concatedIds})`
        }
        let result = await this.getByJson<DataSourceSelectResult<User>>(url, { args })
        return result.dataItems
    }
    async getUser(userId: string): Promise<User> {
        if (!userId) throw errors.argumentNull('userId')

        let args: DataSourceSelectArguments = { filter: `id = "${userId}"` }
        let url = this.url('user/list')
        let result = await this.getByJson<DataSourceSelectResult<User>>(url, { args })
        for (let i = 0; i < result.dataItems.length; i++) {
            result.dataItems[i].data = result.dataItems[i].data || {} as any
        }
        return result.dataItems[0]
    }
    async getUserByMobile(mobile: string) {
        let args = new DataSourceSelectArguments()
        args.filter = `mobile = '${mobile}'`
        let r = await this.getUserList(args)
        return r.dataItems[0]
    }
    async addAdmin(item: Partial<Admin>) {
        let admin = await this.getUserByMobile(item.mobile)
        if (admin != null) {
            let err = errors.userExists(item.mobile)
            alert({ title: '错误', message: err.message })
            return Promise.reject(err)
        }

        let result: { id: string }
        // if (admin == null) {
        let url = this.url('user/add')
        let obj = Object.assign({}, item)
        delete obj.role_ids
        result = await this.postByJson<typeof result>(url, { item: obj })
        item.id = result.id
        // }
        // else {
        //     result = { id: admin.id }
        // }

        url = this.url('application/addUser')
        await this.postByJson(url, { mobile: item.mobile })
        await this.setUserRoles(item.id, item.role_ids || [])

        return result
    }
    async deleteAdmin(userId) {
        let url = this.url('application/removeUser')
        return this.deleteByJson(url, { userId })
    }
    async updateAdmin(item: Partial<Admin>) {
        await this.deleteAdmin(item.id)
        this.addAdmin(item)
    }

    /** 获取菜单列表 */
    async getPlatformMenu(): Promise<MenuItem[]> {
        if (menuItems != null) {
            return menuItems
        }

        let buttonType: ResourceType = 'button'
        let args = new DataSourceSelectArguments()
        args.filter = `category = 'platform' or type = '${buttonType}'`
        let result = this.getMenu(args)
        return result
    }

    /** 获取菜单列表 */
    private async getMenu(args: DataSourceSelectArguments): Promise<MenuItem[]> {

        let result = await this.resourceList(args)
        let resources = result.dataItems
        // 一级级菜单
        menuItems = resources.filter(o => o.parent_id == null)
            .map(o => ({
                id: o.id, name: o.name, visible: o.data.visible == null ? true : o.data.visible,
                path: this.createPath(o)
            } as MenuItem))


        // 二级菜单
        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].children = resources.filter(o => o.parent_id == menuItems[i].id && o.type != 'button')
                .map(o => ({
                    id: o.id,
                    name: o.name,
                    path: this.createPath(o),
                    parent: menuItems[i],
                    visible: o.data.visible == null ? true : o.data.visible,
                } as MenuItem))
        }


        let findMenuItem = function (id) {
            let stack = [...menuItems]
            while (stack.length > 0) {
                let item = stack.pop()
                if (item.id == id) {
                    return item
                }

                let children = item.children || []
                stack.push(...children)
            }
        }

        let commandMenuItems = resources.filter(o => o.type == 'button')
        commandMenuItems.forEach(c => {
            let parent = findMenuItem(c.parent_id)
            if (parent) {
                parent.children = parent.children || []
                let obj = Object.assign({ children: [], visible: false }, c) as MenuItem
                parent.children.push(obj)
                obj.parent = parent
            }
        })

        return menuItems;
    }

    async getMenuItem(id: string): Promise<MenuItem> {
        let args = new DataSourceSelectArguments()
        args.filter = `id = '${id}' or parent_id = '${id}'`
        let r = await this.resourceList(args)
        let dataItem = r.dataItems.filter(o => o.id == id)[0] as MenuItem
        if (!dataItem) return null
        dataItem.children = r.dataItems.filter(o => o.parent_id == id)
            .map(o => Object.assign({ children: [], visible: o.data.visible }, o))

        return dataItem
    }

    private createPath(menuItem: Resource) {
        if (!menuItem.path)
            return ""

        let o = menuItem
        let path = `${o.path}?resourceId=${o.id}&objectType=${(o.path || '').split('/')[0]}`
        return path
    }
    // async login(username: string, password: string) {
    //     let url = this.url('user/login')
    //     let result = await this.postByJson<LoginResult>(url, { username, password })
    //     Service.token.value = result.token
    // }
    // logout() {
    //     Service.token.value = ''
    // }
    static get isLogin() {
        // return (Service.token.value || '') != ''
        return Service.loginInfo.value != null
    }

    async addUser(item: Partial<User>) {
        let url = this.url('user/add')
        let result: { id: string }
        let r = await this.postByJson<typeof result>(url, { item })
        return r
    }
}

