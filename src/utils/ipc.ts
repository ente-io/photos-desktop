import {
    BrowserWindow,
    dialog,
    Tray,
    Notification,
    safeStorage,
    app,
} from 'electron';
import { createWindow } from './createWindow';
import { buildContextMenu } from './menu';
import { getSentryUserID, logErrorSentry } from '../services/sentry';
import chokidar from 'chokidar';
import path from 'path';
import { getDirFilePaths } from '../services/fs';
import { convertHEIC } from '../services/heicConvertor';
import {
    getAppVersion,
    skipAppVersion,
    updateAndRestart,
} from '../services/appUpdater';

import {
    deleteTempFile,
    runFFmpegCmd,
    writeTempFile,
} from '../services/ffmpeg';
import { typedIpcMain } from '../ipc';

export default function setupIpcComs(
    tray: Tray,
    mainWindow: BrowserWindow,
    watcher: chokidar.FSWatcher
): void {
    typedIpcMain.handle('select-dir', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        if (result.filePaths && result.filePaths.length > 0) {
            return result.filePaths[0]?.split(path.sep)?.join(path.posix.sep);
        }
    });

    typedIpcMain.handle('update-tray', (_, args) => {
        tray.setContextMenu(buildContextMenu(mainWindow, args));
    });

    typedIpcMain.handle('send-notification', (_, args) => {
        const notification = {
            title: 'ente',
            body: args,
        };
        new Notification(notification).show();
    });
    typedIpcMain.handle('reload-window', async () => {
        const secondWindow = await createWindow();
        mainWindow.destroy();
        mainWindow = secondWindow;
    });

    typedIpcMain.handle('show-upload-files-dialog', async () => {
        const files = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
        });
        return files.filePaths;
    });

    typedIpcMain.handle('show-upload-zip-dialog', async () => {
        const files = await dialog.showOpenDialog({
            properties: ['openFile', 'multiSelections'],
            filters: [{ name: 'Zip File', extensions: ['zip'] }],
        });
        return files.filePaths;
    });

    typedIpcMain.handle('show-upload-dirs-dialog', async () => {
        const dir = await dialog.showOpenDialog({
            properties: ['openDirectory', 'multiSelections'],
        });

        let files: string[] = [];
        for (const dirPath of dir.filePaths) {
            files = [...files, ...(await getDirFilePaths(dirPath))];
        }

        return files;
    });

    typedIpcMain.handle('add-watcher', (_, args) => {
        watcher.add(args.dir);
    });

    typedIpcMain.handle('remove-watcher', (_, args) => {
        watcher.unwatch(args.dir);
    });

    typedIpcMain.handle('log-error', (_, err, msg, info) => {
        logErrorSentry(err, msg, info);
    });

    typedIpcMain.handle('safeStorage-encrypt', (_, message) => {
        return safeStorage.encryptString(message);
    });

    typedIpcMain.handle('safeStorage-decrypt', (_, message) => {
        return safeStorage.decryptString(message);
    });

    typedIpcMain.handle('get-path', (_, message) => {
        return app.getPath(message);
    });

    typedIpcMain.handle('convert-heic', async (_, fileData) => {
        return await convertHEIC(fileData);
    });

    typedIpcMain.handle('update-and-restart', () => {
        updateAndRestart();
    });
    typedIpcMain.handle('skip-app-version', (_, version) => {
        skipAppVersion(version);
    });
    typedIpcMain.handle('get-sentry-id', () => {
        return getSentryUserID();
    });

    typedIpcMain.handle('get-app-version', () => {
        return getAppVersion();
    });
    typedIpcMain.handle(
        'run-ffmpeg-cmd',
        async (_, cmd, inputFilePath, outputFileName) => {
            return await runFFmpegCmd(cmd, inputFilePath, outputFileName);
        }
    );
    typedIpcMain.handle('write-temp-file', async (_, fileStream, fileName) => {
        return await writeTempFile(fileStream, fileName);
    });
    typedIpcMain.handle('remove-temp-file', async (_, tempFilePath: string) => {
        return await deleteTempFile(tempFilePath);
    });
}