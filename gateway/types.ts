import { ConnectionConfig } from "mysql";
import { Settings as MVCConfig, LogLevel, ServerContext as BaseServerContext } from "maishu-node-mvc";
export { SimpleMenuItem, WebsiteConfig } from "maishu-chitu-admin";
export interface RequireConfig {

}
export interface RequireShim {

}
// export declare type SimpleMenuItem = {
//     name: string;
//     path?: string;
//     icon?: string;
//     children?: SimpleMenuItem[];
// };
export interface PermissionConfigItem {
    roleIds: string[];
}
export interface PermissionConfig {
    [path: string]: PermissionConfigItem;
}
// export declare type WebsiteConfig = {
//     requirejs: RequireConfig;
//     firstPanelWidth?: number;
//     secondPanelWidth?: number;
//     menuItems?: SimpleMenuItem[];
//     permissions?: PermissionConfig;
// };
export interface StationInfo {
    path: string;
    ip: string;
    port: number;
}
export interface Settings {
    port: number,
    db: ConnectionConfig,
    permissions?: PermissionConfig,
    proxy?: { [targetUrl: string]: string },
    headers?: MVCConfig["headers"],
    requestFilters?: MVCConfig["requestFilters"],
    logLevel?: LogLevel,
    virtualPaths?: MVCConfig["virtualPaths"],
    bindIP?: string,
}

export type LoginResult = { userId: string, token?: string };

export interface ServerContextData {
    db: ConnectionConfig,
    logLevel: LogLevel
}

export type ServerContext = BaseServerContext<ServerContextData>;