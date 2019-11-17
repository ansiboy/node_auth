/// <reference path="../declare.d.ts"/>

declare module "js-md5" {
    let md5: {
        (text: string): string;
    };
    export = md5;
}



declare module "json!websiteConfig" {
    let a: import("maishu-chitu-admin/static").WebsiteConfig & WebsiteConfigExt;
    export = a;
}

