import log from 'electron-log';
import { ipcRenderer } from 'electron';

export function logToDisk(logLine: string) {
    log.info(logLine);
}

export function openLogDirectory() {
    ipcRenderer.invoke('open-log-dir');
}

export function logError(error: Error, message: string, info?: string): void {
    ipcRenderer.invoke('log-error', error, message, info);
}

export function getSentryUserID(): Promise<string> {
    return ipcRenderer.invoke('get-sentry-id');
}

export function updateOptOutOfCrashReports(optOut: boolean) {
    return ipcRenderer.invoke('update-opt-out-crash-reports', optOut);
}
