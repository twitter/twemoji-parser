// @flow
// Copyright Twitter Inc. Licensed under MIT
// https://github.com/twitter/twemoji-parser/blob/master/LICENSE.md
import emojiRegex from './lib/regex';

type EmojiEntity = {|
  type: string,
  text: string,
  url: string,
  indices: Array<number>
|};

type ParsingOptions = {|
  buildUrl?: (string, string) => string,
  assetType?: 'png' | 'svg'
|};

export const TypeName = 'emoji';

export function parse(text: string, options?: ParsingOptions): Array<EmojiEntity> {
  const assetType = options && options.assetType ? options.assetType : 'svg';
  const getTwemojiUrl =
    options && options.buildUrl
      ? options.buildUrl
      : (codepoints, assetType) =>
          assetType === 'png'
            ? `https://twemoji.maxcdn.com/v/latest/72x72/${codepoints}.png`
            : `https://twemoji.maxcdn.com/v/latest/svg/${codepoints}.svg`;

  const entities = [];

  emojiRegex.lastIndex = 0;
  while (true) {
    const result = emojiRegex.exec(text);
    if (!result) {
      break;
    }

    const emojiText = result[0];
    const codepoints = toCodePoints(removeVS16s(emojiText)).join('-');

    entities.push({
      url: codepoints ? getTwemojiUrl(codepoints, assetType) : '',
      indices: [result.index, emojiRegex.lastIndex],
      text: emojiText,
      type: TypeName
    });
  }
  return entities;
}

const vs16RegExp = /\uFE0F/g;
// avoid using a string literal like '\u200D' here because minifiers expand it inline
const zeroWidthJoiner = String.fromCharCode(0x200d);

const removeVS16s = rawEmoji => (rawEmoji.indexOf(zeroWidthJoiner) < 0 ? rawEmoji.replace(vs16RegExp, '') : rawEmoji);

export function toCodePoints(unicodeSurrogates: string): Array<string> {
  const points = [];
  let char = 0;
  let previous = 0;
  let i = 0;
  while (i < unicodeSurrogates.length) {
    char = unicodeSurrogates.charCodeAt(i++);
    if (previous) {
      points.push((0x10000 + ((previous - 0xd800) << 10) + (char - 0xdc00)).toString(16));
      previous = 0;
    } else if (char > 0xd800 && char <= 0xdbff) {
      previous = char;
    } else {
      points.push(char.toString(16));
    }
  }
  return points;
}
