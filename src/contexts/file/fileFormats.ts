export type fileTypes = 'image' | 'video' | 'audio' | 'font' | 'all';
export type fileCount = 'single' | 'multiple' | 'none';

export const formats: Record<Exclude<fileTypes, 'all'>, string[]> = {
    image: [ 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', '/' ],
    video: [ 'mp4', 'webm', 'ogg', '/' ],
    font: [ 'ttf', 'otf', 'woff', 'woff2', '/' ],
    audio: [ 'webm', 'wav', 'mp3', 'ogg', 'flac', '/' ]
};