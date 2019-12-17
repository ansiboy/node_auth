import { Resource, User } from "../entities";
import { PermissionDataContext } from "../data-context";
/** 资源控制器 */
export default class ResourceController {
    add(dc: PermissionDataContext, user: User, { item }: {
        item: Resource;
    }): Promise<void>;
    update(dc: PermissionDataContext, { item }: {
        item: Resource;
    }): Promise<{
        id: string;
    }>;
    remove(dc: PermissionDataContext, { id }: {
        id: any;
    }): Promise<{
        id: any;
    }>;
    list(dc: PermissionDataContext): Promise<Resource[]>;
    item(dc: PermissionDataContext, { id }: {
        id: any;
    }): Promise<Resource>;
}