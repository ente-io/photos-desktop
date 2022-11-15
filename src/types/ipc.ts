import { AppUpdateInfo } from '../types';

export type IPCEvents = {
    'resume-export': () => void;
    'stop-export': () => void;
    'pause-export': () => void;
    'retry-export': () => void;
    'show-update-dialog': (updateInfo: AppUpdateInfo) => void;
    'update-and-restart': () => void;
    'skip-app-version': (version: string) => void;
    'watch-add': (filePath: string) => void;
    'watch-unlink': (filePath: string) => void;
    'watch-unlink-dir': (folderPath: string) => void;
};

export type IPCCommands = {
    'select-dir': () => string;
    'show-upload-files-dialog': () => string[];
    'show-upload-zip-dialog': () => string[];
    'show-upload-dirs-dialog': () => string[];
    'safeStorage-encrypt': (message: string) => Buffer;
    'safeStorage-decrypt': (message: Buffer) => string;
    'get-path': (
        name:
            | 'home'
            | 'appData'
            | 'userData'
            | 'cache'
            | 'temp'
            | 'exe'
            | 'module'
            | 'desktop'
            | 'documents'
            | 'downloads'
            | 'music'
            | 'pictures'
            | 'videos'
            | 'recent'
            | 'logs'
            | 'crashDumps'
    ) => string;
    'convert-heic': (fileData: Uint8Array) => Uint8Array;
    'get-sentry-id': () => string;
    'get-app-version': () => string;

    'update-tray': (args: {
        // eslint-disable-next-line camelcase
        export_progress?: any;
        // eslint-disable-next-line camelcase
        retry_export?: any;
        paused?: any;
    }) => void;
    'send-notification': (notification: string) => void;
    'reload-window': () => void;
    'add-watcher': (args: { dir: string }) => void;
    'remove-watcher': (args: { dir: string }) => void;
    'log-error': (err: Error, msg: string, info?: Record<any, any>) => void;
    'update-and-restart': () => void;
    'skip-app-version': (version: string) => void;
};
