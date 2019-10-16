import { InitArguments, Service } from "maishu-chitu-admin/static";
import { PageData, AjaxOptions } from "maishu-chitu";
import { PermissionService } from "./services/permission-service";
import config from "config";

PermissionService.baseUrl = config.permissionServiceUrl;


export default function init(args: InitArguments) {
    let showPage = args.app.showPage;
    args.app.showPage = function (pageUrl: string, args?: PageData, forceRender?: boolean) {
        args = args || {}
        let d = this.parseUrl(pageUrl)
        let names = ['login', 'forget-password', 'register']
        if (names.indexOf(d.pageName) >= 0) {
            args.container = 'simple'
        }

        return showPage.apply(this, [pageUrl, args, forceRender]);
    }
}