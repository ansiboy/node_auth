export declare let errorStatusCodes: {
    noPermission: number;
    userIdNull: number;
};
export declare let errorNames: {
    ActionNotExists: string;
    AdminNotExists: string;
    ApplicationExists: string;
    ApplicationIdRequired: string;
    ApplicationTokenRequired: string;
    ArgumentNull: string;
    CanntGetHeaderFromRequest: string;
    ControllerNotExist: string;
    DeleteResultZero: string;
    FieldNull: string;
    InvalidToken: string;
    NotAllowRegister: string;
    NotImplement: string;
    mobileIsBind: string;
    ObjectNotExistWithId: string;
    PasswordIncorect: string;
    PostIsRequired: string;
    Success: string;
    UserExists: string;
    UserIdRequired: string;
    userNotExists: string;
    UpdateResultZero: string;
    VerifyCodeIncorrect: string;
    VerifyCodeNotMatchMobile: string;
    CanntGetRedirectUrl: string;
    userTokenNotExists: string;
    appTokenNotExists: string;
    noPermission: string;
    userIdNull: string;
    forbidden: string;
};
interface MyError extends Error {
    arguments: any;
}
export declare let errors: {
    argumentNull(argumentName: string): Error;
    argumentEmptyArray(argumentName: string): Error;
    canntGetRedirectUrl(rootDir: string): Error;
    emailExists(email: string): Error;
    usernameExists(username: string): Error;
    forbidden(path: any): Error;
    invalidObjectId(objectId: string): Error;
    mobileExists(mobile: string): Error;
    mobileNotExists(mobile: string): Error;
    actionNotExists(controller: string, action: string): Error;
    argumentFieldNull(fieldName: string, objectName: string): Error;
    userIdRequired(): Error;
    applicationExists(name: string): Error;
    usernameOrPasswordIncorrect(username: string): Error;
    postDataNotJSON(data: string): Error;
    objectNotExistWithId(id: string, name: string): Error;
    verifyCodeIncorrect(verifyCode: string): Error;
    notImplement(): Error;
    argumentTypeIncorrect(paramName: string, expectedTypeName: string): MyError;
    userNameFormatError(username: string): Error;
    userIdNull(): Error;
};
export {};
