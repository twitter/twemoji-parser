export interface EmojiEntity {
  type: 'emoji';
  text: string;
  url: string;
  indices: [number, number];
}

export interface ParsingOptions {
  buildUrl?: (codepoints: string, assetType: 'png' | 'svg') => string;
  assetType?: 'png' | 'svg';
}

export const TypeName: 'emoji';

export function parse(text: string, options?: ParsingOptions): EmojiEntity[];

export function toCodePoints(unicodeSurrogates: string): string[];
