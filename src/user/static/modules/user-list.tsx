import { dataSources, MyUser as User } from "../services/data-sources";
import { boundField, dateTimeField, DataControlField, DataSource } from "maishu-wuzhui-helper";
import { DataListPage } from "maishu-chitu-admin/static";
import { rules } from "maishu-dilu";

export default class UserListPage extends DataListPage<User> {
    dataSource = dataSources.user;
    itemName: string = "用户";
    columns: DataControlField<User>[] = [
        boundField<User>({
            dataField: "mobile", headerText: "用户手机", headerStyle: { width: "240px" },
            validateRules: [rules.required("请输入手机号码")], emptyText: "必填，用户手机号码"
        }),
        boundField<User>({
            dataField: "user_name", headerText: "用户名", headerStyle: { width: "240px" }, readOnly: true,
            emptyText: "可选，用户登录用户名"
        }),
        boundField<User>({
            dataField: "password", headerText: "密码", visible: false,
            emptyText: "必填，用户登录密码"

        }),
        boundField<User>({
            dataField: "email", headerText: "邮箱",
            emptyText: "可选，用户邮箱"
        }),
        boundField<User>({
            dataField: "roleId", headerText: "角色",
            emptyText: "必填，用户角色"
        }),
        dateTimeField<User>({ dataField: "create_date_time", headerText: "最后登录", readOnly: true }),
    ];


}