
import * as validator from 'validator';
import { Database  }  from './../database';
import { Errors } from './../errors';
import { Controller } from './../core/mvc'

class UserGroups {
    static normal = 'normal'
}

export class UserController extends Controller {
    constructor() {
        super();
    }
    test() {
        let user = { name: 'maishu', gender: 'male' };
        return user;
    }
    error() {
        throw new Error('Error');
    }
    async register(args: { username: string, password: string }) {
        if (validator.isNull(args.username)) {
            throw Errors.argumentNull('username');
        }
        if (validator.isNull(args.password)) {
            throw Errors.argumentNull('password');
        }
        let appToken = this.request.headers['appToken'];
        let db = await Database.createInstance(appToken);
    }
    async login(args: { username: string, password: string }) {
        if (validator.isNull(args.username)) {
            throw Errors.argumentNull('username');
        }
        if (validator.isNull(args.password)) {
            throw Errors.argumentNull('password');
        }
        //TODO:验证密码格式
        let appToken = this.request.headers['appToken']; //req.headers['appToken'];
        let db = await Database.createInstance(appToken);
    }
    update(args: any) {

    }
}



