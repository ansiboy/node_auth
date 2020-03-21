import { Service } from "maishu-chitu";
import { Role } from "gateway-entities";

import { PortalWebsiteConfig } from "../../website-config";
import "json!websiteConfig";
let websiteConfig:PortalWebsiteConfig = require("json!websiteConfig");

export class GatewayService extends Service {
    private url(path: string) {
        return `/auth/${path}`;
    }

    async myMenuItems() {
        let url = this.url("menuItem/my");
        let r = await this.get<typeof websiteConfig["menuItems"]>(url);
        return r;
    }

    async stationList() {
        let url = this.url("station/list");
        let r = await this.get<{ path: string }[]>(url);
        return r;
    }

    myRoles() {
        let url = this.url("user/myRoles");
        return this.get<Role[]>(url);
    }

    logout() {
        let url = this.url("user/logout");
        return this.post<boolean>(url);
    }
}