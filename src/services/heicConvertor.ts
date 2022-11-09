import { exec, ExecException } from 'child_process';
import { app } from 'electron';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import { mkdir, readFile, writeFile } from 'promise-fs';
import { generateRandomName } from '../utils/common';
import { logErrorSentry } from '../utils/sentry';

export async function convertHEIC(
    heicFileData: Uint8Array
): Promise<Uint8Array> {
    let tempInputFilePath: string;
    let tempOutputFilePath: string;
    try {
        const tempDir = path.join(app.getPath('temp'), 'ente');
        if (!existsSync(tempDir)) {
            await mkdir(tempDir);
        }
        const tempName = generateRandomName(10);

        tempInputFilePath = path.join(tempDir, tempName + '.heic');
        tempOutputFilePath = path.join(tempDir, tempName + '.jpeg');

        await writeFile(tempInputFilePath, heicFileData);

        await new Promise((resolve, reject) => {
            exec(
                `sips -s format jpeg ${tempInputFilePath} --out ${tempOutputFilePath}`,
                (
                    error: ExecException | null,
                    stdout: string,
                    stderr: string
                ) => {
                    if (error) {
                        reject(error);
                    } else if (stderr) {
                        reject(stderr);
                    } else {
                        resolve(stdout);
                    }
                }
            );
        });
        const convertedFileData = new Uint8Array(
            await readFile(tempOutputFilePath)
        );
        return convertedFileData;
    } catch (e) {
        logErrorSentry(e, 'failed to convert heic');
        throw e;
    } finally {
        try {
            rmSync(tempInputFilePath);
        } catch (e) {
            logErrorSentry(e, 'failed to remove tempInputFile');
        }
        try {
            rmSync(tempOutputFilePath);
        } catch (e) {
            logErrorSentry(e, 'failed to remove tempOutputFile');
        }
    }
}
