import { spawn } from 'child_process';
import pathToFfmpeg from 'ffmpeg-static';

function getFFmpegStaticPath() {
    return pathToFfmpeg.replace('app.asar', 'app.asar.unpacked');
}

export function liveTranscodeVideoForStreaming(
    inputFile: NodeJS.ReadableStream
) {
    const ffmpeg = spawn(getFFmpegStaticPath(), [
        '-i',
        'pipe:0',
        '-vcodec',
        'libvpx',
        '-acodec',
        'libopus',
        '-deadline',
        'realtime',
        '-speed',
        '4',
        '-tile-columns',
        '6',
        '-frame-parallel',
        '1',
        '-f',
        'webm',
        'pipe:1',
    ]);

    inputFile.pipe(ffmpeg.stdin);
    return ffmpeg.stdout;
}
