import { Service } from "maishu-chitu-admin/static";
import { LocalValueStore } from "maishu-chitu-service";
import md5 = require("js-md5");
import { DataSource, DataSourceSelectResult, DataSourceArguments } from "maishu-wuzhui-helper";
import { LoginResult } from "gateway";

export enum DataSourceMethods {
    insert = 2,
    update = 4,
    delete = 8,
    all = DataSourceMethods.insert & DataSourceMethods.update & DataSourceMethods.delete
}

export class LocalService extends Service {

    loginInfo = new LocalValueStore<any>("login-info");

    async login(username: string, password: string) {
        password = md5(password);
        let r = await this.postByJson<LoginResult>("login", { username, password });
        this.loginInfo.value = r;
        document.cookie = `token=${r.token}`;

        return r;
    }

    dataSource<T extends ({ id: string })>(name: string, methods?: DataSourceMethods): DataSource<T> {
        methods = methods || DataSourceMethods.all;
        let options: DataSourceArguments<T> = {
            primaryKeys: ["id"],
            select: async (args) => {
                let url = `data-sources/select_${name}`
                let r = await this.postByJson<DataSourceSelectResult<T>>(url, { args });
                return r;
            }
        };

        if ((methods & DataSourceMethods.insert) == DataSourceMethods.insert) {
            options.insert = async (args) => {
                let url = `data-sources/select_${name}`
                let r = await this.postByJson<DataSourceSelectResult<T>>(url, { args });
                return r;
            }
        }

        if ((methods & DataSourceMethods.update) == DataSourceMethods.update) {
            options.update = async (item) => {
                let url = `data-sources/update_${name}`
                let r = await this.postByJson<DataSourceSelectResult<T>>(url, { item });
                return r;
            }
        }

        if ((methods & DataSourceMethods.delete) == DataSourceMethods.delete) {
            options.delete = async (item) => {
                let url = `data-sources/delete_${name}`
                let r = await this.postByJson<DataSourceSelectResult<T>>(url, { item });
                return r;
            }
        }

        let ds = new DataSource<T>(options);
        return ds;
    }
}

