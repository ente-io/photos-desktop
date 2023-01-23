import { ipcRenderer } from 'electron';
import { existsSync } from 'fs';
import {
    convertWebStreamToNode,
    convertNodeStreamToWeb,
    writeStream,
} from '../services/fs';
import { logError } from '../services/logging';
import { ElectronFile } from '../types';
import fs from 'fs';
import { liveTranscodeVideoForStreaming } from '../services/ffmpeg-live-transcoding';

export async function runFFmpegCmd(
    cmd: string[],
    inputFile: File | ElectronFile,
    outputFileName: string
) {
    let inputFilePath = null;
    let createdTempInputFile = null;
    try {
        if (!existsSync(inputFile.path)) {
            const tempFilePath = await ipcRenderer.invoke(
                'get-temp-file-path',
                inputFile.name
            );
            await writeStream(tempFilePath, await inputFile.stream());
            inputFilePath = tempFilePath;
            createdTempInputFile = true;
        } else {
            inputFilePath = inputFile.path;
        }
        const outputFileData = await ipcRenderer.invoke(
            'run-ffmpeg-cmd',
            cmd,
            inputFilePath,
            outputFileName
        );
        return new File([outputFileData], outputFileName);
    } finally {
        if (createdTempInputFile) {
            try {
                await ipcRenderer.invoke('remove-temp-file', inputFilePath);
            } catch (e) {
                logError(e, 'failed to deleteTempFile');
            }
        }
    }
}

export async function liveTranscodeVideo(inputFile: File | ElectronFile) {
    let inputFileStream: NodeJS.ReadableStream;
    if (!existsSync(inputFile.path)) {
        inputFileStream = convertWebStreamToNode(await inputFile.stream());
    } else {
        inputFileStream = fs.createReadStream(inputFile.path);
    }

    return convertNodeStreamToWeb(
        liveTranscodeVideoForStreaming(inputFileStream)
    );
}
