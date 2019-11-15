import { AuthDataContext } from "../data-context";
import { SelectArguments, BaseController } from "./base-controller";
import { Token } from "../entities";
export default class TokenController extends BaseController {
    list(dc: AuthDataContext, { args }: {
        args: SelectArguments;
    }): Promise<import("./base-controller").SelectResult<Token>>;
}
