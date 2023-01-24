import { ipcRenderer } from 'electron';
import { existsSync } from 'fs';
import {
    convertWebStreamToNode,
    convertNodeStreamToWeb,
    writeStream,
} from '../services/fs';
import { logError } from '../services/logging';
import { ElectronFile } from '../types';
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

export function liveTranscodeVideo(
    inputFileStream: ReadableStream<Uint8Array>
) {
    const output = liveTranscodeVideoForStreaming(
        convertWebStreamToNode(inputFileStream)
    );
    return {
        stream: convertNodeStreamToWeb(output.stream),
        durationRef: output.durationRef,
    };
}
