import * as FS from 'fs';
import * as PromiseFS from 'fs/promises';

const removePPIFromError = (e: any) => {
    if (e.code === 'EPERM') {
        return new Error('Permission denied');
    }
    return new Error(e.code);
};

const sanitized = <T extends any[], P>(
    fn: (...ags: T) => P
): ((...args: T) => P) => {
    return (...args: T): P => {
        try {
            return fn(...args);
        } catch (e) {
            throw removePPIFromError(e);
        }
    };
};

export const existsSync = sanitized(FS.existsSync);

export const mkdir = sanitized(PromiseFS.mkdir);

export const rmSync = sanitized(FS.rmSync);

export const writeFile = sanitized(PromiseFS.writeFile);

export const readFile = sanitized(PromiseFS.readFile);

export const unlink = sanitized(PromiseFS.unlink);
