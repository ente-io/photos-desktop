import { ipcRenderer } from 'electron/renderer';
import { logError } from '../services/logging';

export const selectRootDirectory = async (): Promise<string> => {
    try {
        return await ipcRenderer.invoke('select-dir');
    } catch (e) {
        logError(e, 'error while selecting root directory');
    }
};

export const getAppVersion = async (): Promise<string> => {
    try {
        return await ipcRenderer.invoke('get-app-version');
    } catch (e) {
        logError(e, 'failed to get release version');
        throw e;
    }
};

export {
    logToDisk,
    openLogDirectory,
    getSentryUserID,
} from '../services/logging';
