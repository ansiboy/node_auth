import { statusCodes } from "./status-codes";

export let errors = {
    argumentNull(argumentName: string): Error {
        let msg = `Argument '${argumentName}' cannt be null`;
        let error = new Error(msg);
        error.name = `${statusCodes.argumentNull} ${errors.argumentNull.name}`;
        return error;
    },
    routeDataFieldNull<T>(fieldName: keyof T): Error {
        let msg = `The '${fieldName}' field of route data cannt be null.`;
        let error = new Error(msg);
        error.name = `${statusCodes.fieldNull} ${errors.routeDataFieldNull.name}`;
        return error;
    },
    userNotLogin(requestURL: string): Error {
        let msg = `User id is required.request url is ${requestURL}.`;
        let err = new Error(msg);
        err.name = `${statusCodes.userNotLogin} ${errors.userNotLogin.name}`;

        return err;
    },
    forbidden(path) {
        let msg = `Path ${path} can not access`;
        let error = new Error(msg);
        error.name = `${statusCodes.forbidden} ${errors.forbidden.name}`;
        return error;
    },
}