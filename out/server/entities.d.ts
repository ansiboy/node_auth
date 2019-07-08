interface Model {
    id: string;
    create_date_time: Date;
}
export declare class Role implements Model {
    id: string;
    name: string;
    remark: string;
    data?: any;
    create_date_time: Date;
    resources?: Resource[];
    /**
     * 是否系统内置的角色
     */
    is_system?: boolean;
    role_id?: string;
    parent_id?: string;
}
export declare class Category implements Model {
    id: string;
    code: string;
    name: string;
    create_date_time: Date;
}
export declare class Resource implements Model {
    id: string;
    name: string;
    page_path?: string;
    parent_id?: string;
    sort_number: number;
    type: string;
    create_date_time: Date;
    data?: any;
    api_paths?: Path[];
}
export declare class Token {
    id: string;
    content: string;
    content_type: string;
    create_date_time: Date;
}
export declare class User implements Model {
    id: string;
    user_name?: string;
    mobile?: string;
    email?: string;
    password?: string;
    create_date_time: Date;
    data?: object;
    openid?: string;
    is_system?: boolean;
    role_id?: string;
    role?: Role;
}
export declare class UserRole {
    user_id: string;
    role_id: string;
}
export declare class UserLatestLogin implements Model {
    id: string;
    latest_login: Date;
    create_date_time: Date;
}
export declare class SMSRecord implements Model {
    id: string;
    mobile: string;
    content: string;
    code?: string;
    create_date_time: Date;
}
export declare class Path implements Model {
    id: string;
    create_date_time: Date;
    value: string;
    remark?: string;
    resource_id?: string;
    resource?: Resource;
}
export {};
