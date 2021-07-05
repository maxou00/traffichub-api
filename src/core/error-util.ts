export const ErrorCodes = {
    AUTH_FAILURE: "AUTH_FAILURE",
    SIGNUP_FAILURE: "SIGNUP_FAILURE",
    BAD_REQUEST: "BAD_REQUEST"
}

export function stackError(code: string, stack: any) {
    return {code, stack}
}