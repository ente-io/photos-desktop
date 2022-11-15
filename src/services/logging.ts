import log from 'electron-log';
import { typedIpcRenderer } from '../types/ipc';

export function logToDisk(logLine: string) {
    log.info(logLine);
}

export function openLogDirectory() {
    typedIpcRenderer.invoke('get-path', 'logs');
}

export function logError(
    error: Error,
    message: string,
    info?: Record<any, any>
): void {
    typedIpcRenderer.invoke('log-error', error, message, info);
}

export function getSentryUserID(): Promise<string> {
    return typedIpcRenderer.invoke('get-sentry-id');
}
