import log from 'electron-log';
import { typedIpcRenderer } from '../ipc';

export function logToDisk(logLine: string) {
    log.info(logLine);
}

export async function openLogDirectory() {
    await typedIpcRenderer.invoke('get-path', 'logs');
}

export async function logError(
    error: Error,
    message: string,
    info?: Record<any, any>
): Promise<void> {
    await typedIpcRenderer.invoke('log-error', error, message, info);
}

export async function getSentryUserID(): Promise<string> {
    return await typedIpcRenderer.invoke('get-sentry-id');
}
