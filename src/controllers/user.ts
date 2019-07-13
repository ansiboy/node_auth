import { errors } from '../errors';
import { TokenManager } from '../token';
import { controller, formData, action } from 'maishu-node-mvc';
import { currentUserId, currentUser, currentTokenId } from '../decorators';
import { authDataContext, AuthDataContext } from '../dataContext';
import { User, LoginResult } from '../entities';
import LatestLoginController from './latest-login';
import { BaseController, SelectArguments } from './base-controller';
import { actionPaths } from '../common';
import SMSController from './sms';
import { guid } from '../utility';


@controller('/user')
export default class UserController {

    //====================================================
    /** 手机是否已注册 */
    @action(actionPaths.user.isMobileRegister)
    async isMobileRegister(@authDataContext dc: AuthDataContext, @formData { mobile }): Promise<boolean> {
        if (!mobile) throw errors.argumentNull('mobile')
        if (!dc) throw errors.argumentNull('dc')

        let user = await dc.users.findOne({ mobile });
        return user != null;
    }

    @action(actionPaths.user.isUserNameRegister)
    async isUserNameRegister(@authDataContext dc: AuthDataContext, @formData { user_name }): Promise<boolean> {
        if (!user_name) throw errors.argumentNull('user_name')
        if (!dc) throw errors.argumentNull('dc')

        let user = await dc.users.findOne({ user_name });
        return user != null;

    }

    @action(actionPaths.user.isEmailRegister)
    async isEmailRegister(@authDataContext dc: AuthDataContext, @formData { email }): Promise<boolean> {
        if (!email) throw errors.argumentNull('user_name')
        if (!dc) throw errors.argumentNull('dc')

        let user = await dc.users.findOne({ email });
        return user != null;
    }

    @action(actionPaths.user.register)
    async register(@authDataContext dc: AuthDataContext,
        @formData { mobile, password, smsId, verifyCode, data }: { mobile: string, password: string, smsId: string, verifyCode: string, data: any }) {
        if (mobile == null)
            throw errors.argumentNull('mobile');

        if (!password)
            throw errors.argumentNull('password')

        if (smsId == null)
            throw errors.argumentNull('smsId');

        if (verifyCode == null)
            throw errors.argumentNull('verifyCode');

        data = data || {}

        // let sql = `select code from sms_record where id = ?`
        // let [rows] = await execute(conn, sql, [smsId])
        // if (rows == null || rows.length == 0 || rows[0].code != verifyCode) {
        //     throw errors.verifyCodeIncorrect(verifyCode)
        // }
        let ctrl = new SMSController();
        if (!ctrl.checkVerifyCode(dc, { smsId, verifyCode }))
            throw errors.verifyCodeIncorrect(verifyCode);

        let user = {
            id: guid(), mobile, password, data,
            create_date_time: new Date(Date.now()),
        }

        // sql = 'insert into user set ?'
        // await execute(conn, sql, user)
        await dc.users.insert(user)

        let token = await TokenManager.create({ user_id: user.id } as UserToken);
        return { token: token.id, userId: user.id };
    }

    @action(actionPaths.user.resetPassword)
    async resetPassword(@authDataContext dc: AuthDataContext, @formData { mobile, password, smsId, verifyCode }) {
        if (mobile == null)
            throw errors.argumentNull('mobile');

        if (!password)
            throw errors.argumentNull('password')

        if (smsId == null)
            throw errors.argumentNull('smsId');

        if (verifyCode == null)
            throw errors.argumentNull('verifyCode');

        let user = await dc.users.findOne({ mobile });
        if (user == null) {
            throw errors.mobileNotExists(mobile)
        }

        user.password = password;
        await dc.users.save(user);

        let token = await TokenManager.create({ user_id: user.id } as UserToken);
        return { token: token.id, userId: user.id };
    }

    @action(actionPaths.user.resetMobile)
    async resetMobile(@authDataContext dc: AuthDataContext, @currentUserId userId: string, @formData { mobile, smsId, verifyCode }) {
        if (mobile == null)
            throw errors.argumentNull('mobile');

        if (smsId == null)
            throw errors.argumentNull('smsId');

        if (verifyCode == null)
            throw errors.argumentNull('verifyCode');

        let isMobileRegister = await this.isMobileRegister(dc, { mobile })
        if (isMobileRegister)
            throw errors.mobileExists(mobile)

        let smsRecord = await dc.smsRecords.findOne({ id: smsId });
        if (smsRecord == null || smsRecord.code != verifyCode) {
            throw errors.verifyCodeIncorrect(verifyCode)
        }

        await dc.users.update({ id: userId }, { mobile })

        return { id: userId };
    }

    async loginByUserName(dc: AuthDataContext, { username, password }): Promise<LoginResult> {

        if (!username) throw errors.argumentNull("username")
        if (!password) throw errors.argumentNull('password')

        //TODO: 检查 username 类型
        let usernameRegex = /^[a-zA-Z\-]+$/;
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let type: 'mobile' | 'username' | 'email' =
            usernameRegex.test(username) ? 'username' :
                emailRegex.test(username) ? 'email' : 'mobile' //'mobile'

        let user: User;
        switch (type) {
            default:
            case 'mobile':
                // sql = `select id from user where mobile = ? and password = ?`
                user = await dc.users.findOne({ mobile: username, password });
                break
            case 'username':
                // sql = `select id from user where user_name = ? and password = ?`
                user = await dc.users.findOne({ user_name: username, password });
                break
            case 'email':
                // sql = `select id from user where email = ? and password = ?`
                user = await dc.users.findOne({ email: username, password });
                break
        }

        // let [rows] = await execute(conn, sql, [username, password])

        // let user: User = rows == null ? null : rows[0]
        if (user == null) {
            throw errors.usernameOrPasswordIncorrect(username)
        }

        let token = await TokenManager.create({ user_id: user.id } as UserToken)
        return { token: token.id, userId: user.id, roleId: user.role_id }
    }

    private async loginByOpenId<T extends { openid }>(dc: AuthDataContext, args: T): Promise<LoginResult> {
        let { openid } = args
        if (!openid) throw errors.argumentNull('openid')
 
        let user = await dc.users.findOne({ openid: openid });
        if (user == null) {
            user = {
                id: guid(), openid, create_date_time: new Date(Date.now()),
                data: args
            } as User
            await dc.users.save(user);
        }

        let token = await TokenManager.create({ user_id: user.id });
        return { token: token.id, userId: user.id, roleId: user.role_id };
    }

    private async loginByVerifyCode(@authDataContext dc: AuthDataContext,
        @formData args: { mobile: string, smsId: string, verifyCode: string }): Promise<LoginResult> {

        let { mobile, smsId, verifyCode } = args

        let user = await dc.users.findOne({ mobile });
        if (user == null)
            throw errors.mobileExists(mobile);

        let smsRecord = await dc.smsRecords.findOne(smsId);
        if (smsRecord == null || smsRecord.code != verifyCode)
            throw errors.verifyCodeIncorrect(verifyCode);

        let token = await TokenManager.create({ user_id: user.id } as UserToken)
        return { token: token.id, userId: user.id, roleId: user.role_id }
    }

    @action(actionPaths.user.login)
    async login(@authDataContext dc: AuthDataContext, @formData args: any): Promise<LoginResult> {
        args = args || {}

        let p: LoginResult;
        if (args.openid) {
            p = await this.loginByOpenId(dc, args)
        }
        else if (args.smsId) {
            p = await this.loginByVerifyCode(dc, args)
        }
        else {
            p = await this.loginByUserName(dc, args)
        }

        let r = await dc.userLatestLogins.findOne(p.userId);//.then(r => {
        if (r == null) {
            r = { id: p.userId, latest_login: new Date(Date.now()), create_date_time: new Date(Date.now()) };
        }
        else {
            r.latest_login = new Date(Date.now());
        }
        await dc.userLatestLogins.save(r);


        return p
    }

    @action(actionPaths.user.logout)
    async logout(@currentTokenId tokenId: string) {
        await TokenManager.remove(tokenId);
        return {};
    }

    /** 获取登录用户的信息 */
    @action(actionPaths.user.me)
    async me(@currentUser user: User) {
        return user;
    }

    /** 获取用户信息 */
    @action(actionPaths.user.item)
    async item(@authDataContext dc: AuthDataContext, @formData { userId }: { userId: string }) {
        if (!userId) throw errors.userIdNull();

        let user = await dc.users.findOne(userId);
        return user
    }

    /**
     * 获取当前登录用户角色
     * @param param0
     * 1. userId string 
     */
    @action()
    async getRoles(@authDataContext dc: AuthDataContext, @currentUserId userId) {
        if (!userId) throw errors.userIdNull();

        let item = await dc.users.findOne({
            where: { id: userId },
            select: ["role_id"]
        });

        return item.role_id;
    }

    // /**
    //  * 设置用户权限
    //  * @param param0 
    //  * 1. userId string, 用设置权限的用户 ID
    //  * 1. roleIds string[], 角色 ID 数组
    //  */
    // @action()
    // async setRoles(@connection conn: mysql.Connection, @formData { userId, roleIds }) {
    //     if (!userId) throw errors.userIdNull();
    //     if (!roleIds) throw errors.argumentNull('roleIds')
    //     if (!conn) throw errors.argumentNull('conn')
    //     if (!Array.isArray(roleIds)) throw errors.argumentTypeIncorrect('roleIds', 'array')

    //     await execute(conn, `delete from user_role where user_id = ?`, userId)

    //     if (roleIds.length > 0) {
    //         let values = []
    //         let sql = `insert into user_role (user_id, role_id) values `
    //         for (let i = 0; i < roleIds.length; i++) {
    //             sql = sql + "(?,?)"
    //             values.push(userId, roleIds[i])
    //         }

    //         await execute(conn, sql, values)
    //     }
    // }

    // /**
    //  * 获取用户角色编号
    //  */
    // @action("/role/userRoleIds", "role/ids")
    // async userRoleIds(@authDataContext dc: AuthDataContext, @formData { userIds }: { userIds: string[] }): Promise<{ user_id: string, role_id: string }[]> {
    //     if (userIds == null) throw errors.argumentNull('userIds');
    //     if (dc == null) throw errors.argumentNull('conn');

    //     if (!userIds) throw errors.argumentNull("userIds");
    //     let users = await dc.users.findByIds(userIds);
    //     let result = users.map(o => ({ user_id: o.id, role_id: o.role_id }));

    //     return result;
    // }


    // @action("addRoles", "role/add")
    // async addRoles(@connection conn: mysql.Connection, @formData { userId, roleIds }) {
    //     if (!userId) throw errors.argumentNull("userId")
    //     if (!roleIds) throw errors.argumentNull("roleIds")
    //     if (!conn) throw errors.argumentNull("conn")

    //     if (!Array.isArray(roleIds)) throw errors.argumentTypeIncorrect('roleIds', 'array')
    //     if (roleIds.length == 0)
    //         return errors.argumentEmptyArray("roleIds")

    //     let roleController = new RoleController()
    //     let userRoles = await this.userRoleIds(conn, { userIds: [userId] })
    //     let userRoleIds = userRoles.map(o => o.role_id)
    //     let values = []
    //     let sql = `insert into user_role (user_id, role_id) values `
    //     for (let i = 0; i < roleIds.length; i++) {
    //         if (userRoleIds.indexOf(roleIds[i]) >= 0)
    //             continue

    //         sql = sql + "(?,?)"
    //         values.push(userId, roleIds[i])
    //     }

    //     if (values.length > 0)
    //         await execute(conn, sql, values)
    // }

    @action(actionPaths.user.list)
    async list(@authDataContext dc: AuthDataContext, @formData { args }: { args: SelectArguments }) {
        args = args || {};
        if (args.filter) {
            args.filter = args.filter + " and (User.is_system is null or User.is_system = false)";
        }
        else {
            args.filter = "(User.is_system is null or User.is_system = false)";
        }

        let result = await BaseController.list<User>(dc.users, {
            selectArguments: args, relations: ["role"],
            fields: ["id", "mobile", "user_name", "email", "create_date_time"]
        })

        if (result.dataItems.length > 0) {
            let userIds = result.dataItems.map(o => o.id);
            let ctrl = new LatestLoginController();
            let latestLogins = await ctrl.list(dc, { userIds });
            result.dataItems.forEach(user => {
                user["lastest_login"] = latestLogins.filter(login => login.id == user.id)
                    .map(o => o.latest_login)[0];
            })
        }

        return result
    }

    /** 添加用户 */
    @action(actionPaths.user.add)
    async add(@authDataContext dc: AuthDataContext, @formData { item }: { item: User }): Promise<Partial<User>> {
        if (item.mobile) {
            let isMobileRegister = await this.isMobileRegister(dc, { mobile: item.mobile })
            if (isMobileRegister)
                return Promise.reject(errors.mobileExists(item.mobile))
        }

        if (item.email) {
            let isEmailRegister = await this.isEmailRegister(dc, { email: item.email })
            if (isEmailRegister)
                return Promise.reject(errors.emailExists(item.email))
        }

        if (item.user_name) {
            let isUserNameRegister = await this.isUserNameRegister(dc, { user_name: item.user_name })
            if (isUserNameRegister)
                return Promise.reject(errors.usernameExists(item.user_name))
        }

        item.id = guid();
        item.create_date_time = new Date(Date.now());

        await dc.users.save(item);

        if (item.role_id) {
            item.role = await dc.roles.findOne(item.role_id); //roleIds.map(o => ({ id: o }) as Role)
        }

        return { id: item.id, role: item.role, create_date_time: item.create_date_time };
    }

    @action(actionPaths.user.remove)
    async remove(@authDataContext dc: AuthDataContext, @formData { id }) {
        if (!id) throw errors.argumentFieldNull("id", "formData");
        await dc.users.delete(id);
        return { id };
    }

    @action(actionPaths.user.update)
    async update(@authDataContext dc: AuthDataContext, @formData { user }: { user: User }) {
        if (!user) throw errors.argumentNull('user');
        if (!user.id) throw errors.argumentFieldNull("id", "user");

        let entity: Partial<User> = {
            id: user.id, email: user.email, role_id: user.role_id,
        };

        if (user.password)
            entity.password = user.password;

        await dc.users.save(entity);

        if (user.role_id) {
            entity.role = await dc.roles.findOne(user.role_id);
        }

        return { id: entity.id, role: entity.role } as Partial<User>
    }

    @action(actionPaths.user.latestLogin)
    async userLatestLogin(@authDataContext dc: AuthDataContext, @formData { userIds }: { userIds: string[] }) {
        let items = await dc.userLatestLogins.createQueryBuilder()
            .where(" id in (...:userIds)")
            .setParameter("userIds", userIds)
            .getMany();

        return items;
    }

}





