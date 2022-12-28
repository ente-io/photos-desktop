import util from 'util';
import { exec } from 'child_process';

import { existsSync, rmSync } from 'fs';
import { readFile, writeFile } from 'promise-fs';
import { generateTempFilePath } from '../utils/temp';
import { logErrorSentry } from './sentry';
import { isPlatform } from '../utils/main';
import { isDev } from '../utils/common';
import path from 'path';

const asyncExec = util.promisify(exec);

function getImageMagickStaticPath() {
    return isDev
        ? 'build/image-magick'
        : path.join(process.resourcesPath, 'image-magick');
}

export async function convertHEIC(
    heicFileData: Uint8Array
): Promise<Uint8Array> {
    let tempInputFilePath: string;
    let tempOutputFilePath: string;
    try {
        tempInputFilePath = await generateTempFilePath('.heic');
        tempOutputFilePath = await generateTempFilePath('.jpeg');

        await writeFile(tempInputFilePath, heicFileData);

        await runConvertCommand(tempInputFilePath, tempOutputFilePath);

        if (!existsSync(tempOutputFilePath)) {
            throw new Error('heic convert output file not found');
        }
        const convertedFileData = new Uint8Array(
            await readFile(tempOutputFilePath)
        );
        return convertedFileData;
    } catch (e) {
        logErrorSentry(e, 'failed to convert heic');
        throw e;
    } finally {
        try {
            rmSync(tempInputFilePath, { force: true });
        } catch (e) {
            logErrorSentry(e, 'failed to remove tempInputFile');
        }
        try {
            rmSync(tempOutputFilePath, { force: true });
        } catch (e) {
            logErrorSentry(e, 'failed to remove tempOutputFile');
        }
    }
}

async function runConvertCommand(
    tempInputFilePath: string,
    tempOutputFilePath: string
) {
    if (isPlatform('mac')) {
        await asyncExec(
            `sips -s format jpeg ${tempInputFilePath} --out ${tempOutputFilePath}`
        );
    } else if (isPlatform('linux')) {
        await asyncExec(
            `${getImageMagickStaticPath()} ${tempInputFilePath} -quality 100% ${tempOutputFilePath}`
        );
    } else {
        Error(`${process.platform} native heic convert not supported yet`);
    }
}
