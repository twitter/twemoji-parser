// Copyright Twitter Inc. Licensed under MIT
// https://github.com/twitter/twemoji-parser/blob/master/LICENSE.md
import { parse, TypeName } from '..';

test('TypeName is exported', () => {
  expect(TypeName).toBe('emoji');
});

describe('parse', () => {
  describe('General Behavior', () => {
    test('entities have emoji type', () => {
      expect(parse('I \u2764 emoji!')).toMatchObject([
        {
          type: 'emoji',
          text: '\u2764'
        }
      ]);
    });

    test('extracts entities', () => {
      expect(parse('I \u2764 emoji!')).toMatchObject([
        {
          indices: [2, 3],
          text: '\u2764'
        }
      ]);
    });

    test('converts "as-image" variants', () => {
      expect(parse('I \u2764\uFE0F emoji!')).toMatchObject([
        {
          indices: [2, 4],
          text: '\u2764\uFE0F'
        }
      ]);
    });

    test('leaves "as-text" variants alone', () => {
      expect(parse('I \u2764\uFE0E emoji!')).toMatchObject([]);
    });

    test('extracts multi-char emoji', () => {
      expect(parse('\ud83d\ude2c')).toMatchObject([
        {
          indices: [0, 2],
          text: '\ud83d\ude2c'
        }
      ]);
    });

    test('stray VS16s are captured and identified', () => {
      const entities = parse('\ufe0f');
      expect(entities).toMatchObject([
        {
          url: '',
          indices: [0, 1],
          text: '\ufe0f'
        }
      ]);
    });

    test('extracts multiple emoji', () => {
      expect(parse('\ud83d\ude2c\ud83d\ude8b \ud83d\ude8a')).toMatchObject([
        {
          indices: [0, 2],
          text: '\ud83d\ude2c'
        },
        {
          indices: [2, 4],
          text: '\ud83d\ude8b'
        },
        {
          indices: [5, 7],
          text: '\ud83d\ude8a'
        }
      ]);
    });

    test('sets correct indices when same emoji appears multiple times', () => {
      expect(parse('\u2764\u2764 tacos \u2764')).toMatchObject([
        {
          indices: [0, 1],
          text: '\u2764'
        },
        {
          indices: [1, 2],
          text: '\u2764'
        },
        {
          indices: [9, 10],
          text: '\u2764'
        }
      ]);
    });
  });

  describe('URLs', () => {
    test('use MaxCDN SVGs by default', () => {
      expect(parse('I \u2764 emoji!')).toMatchObject([
        {
          url: 'https://twemoji.maxcdn.com/2/svg/2764.svg'
        }
      ]);
    });

    test('can ask for MaxCDN PNGs', () => {
      expect(parse('I \u2764 emoji!', { assetType: 'png' })).toMatchObject([
        {
          url: 'https://twemoji.maxcdn.com/2/72x72/2764.png'
        }
      ]);
    });

    test('unrecognized assetType defaults back to SVG', () => {
      expect(parse('I \u2764 emoji!', { assetType: 'svg' })).toMatchObject([
        {
          url: 'https://twemoji.maxcdn.com/2/svg/2764.svg'
        }
      ]);
    });

    test('getUrl function is used if provided', () => {
      const buildUrl = (codepoints, assetType) => `https://example.com/${codepoints}.${assetType}`;

      expect(parse('I \u2764 emoji!', { buildUrl })).toMatchObject([
        {
          url: 'https://example.com/2764.svg'
        }
      ]);
    });

    test('can specify a custom getUrl and PNG assetType', () => {
      const buildUrl = (codepoints, assetType) => `https://example.com/${codepoints}.${assetType}`;

      expect(parse('I \u2764 emoji!', { buildUrl, assetType: 'png' })).toMatchObject([
        {
          url: 'https://example.com/2764.png'
        }
      ]);
    });
  });
});

describe('version spot checks', () => {
  describe('Twemoji 2.3 (Unicode Emoji 5.0)', () => {
    test('Woman climbing', () => {
      expect(parse('\ud83e\uddd7\u200d\u2640\ufe0f')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\uddd7\u200d\u2640\ufe0f'
        }
      ]);
    });

    test('Exploding head', () => {
      expect(parse('\ud83e\udd2f')).toMatchObject([
        {
          indices: [0, 2],
          text: '\ud83e\udd2f'
        }
      ]);
    });
  });

  describe('Twemoji 2.4', () => {
    test('Woman in business suit levitating (dark skin tone)', () => {
      expect(parse('\ud83d\udd74\ud83c\udfff\u200d\u2640\ufe0f')).toMatchObject([
        {
          indices: [0, 7],
          text: '\ud83d\udd74\ud83c\udfff\u200d\u2640\ufe0f'
        }
      ]);
    });

    test('Woman in tuxedo', () => {
      expect(parse('\ud83e\udd35\u200d\u2640\ufe0f')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\udd35\u200d\u2640\ufe0f'
        }
      ]);
    });
  });

  describe('Twemoji 2.5', () => {
    describe('copyright', () => {
      test('without VS16 is not emoji', () => {
        expect(parse('\u00a9')).toEqual([]);
      });

      test('with VS16 is emoji', () => {
        expect(parse('\u00a9\ufe0f')).toMatchObject([
          {
            indices: [0, 2],
            text: '\u00a9\ufe0f'
          }
        ]);
      });
    });
    describe('registered', () => {
      test('without VS16 is not emoji', () => {
        expect(parse('\u00ae')).toEqual([]);
      });

      test('with VS16 is emoji', () => {
        expect(parse('\u00ae\ufe0f')).toMatchObject([
          {
            indices: [0, 2],
            text: '\u00ae\ufe0f'
          }
        ]);
      });
    });

    describe('trademark', () => {
      test('without VS16 is not emoji', () => {
        expect(parse('\u2122')).toEqual([]);
      });

      test('with VS16 is emoji', () => {
        expect(parse('\u2122\ufe0f')).toMatchObject([
          {
            indices: [0, 2],
            text: '\u2122\ufe0f'
          }
        ]);
      });
    });
  });

  describe('Emoji 11.0', () => {
    test('Man, red haired (dark skin tone)', () => {
      expect(parse('\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddb0')).toMatchObject([
        {
          indices: [0, 7],
          text: '\ud83d\udc68\ud83c\udfff\u200d\ud83e\uddb0'
        }
      ]);
    });

    test('Woman, curly haired (medium light skin tone)', () => {
      expect(parse('\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddb1')).toMatchObject([
        {
          indices: [0, 7],
          text: '\ud83d\udc69\ud83c\udffc\u200d\ud83e\uddb1'
        }
      ]);
    });

    test('Man, bald (medium dark skin tone)', () => {
      expect(parse('\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddb2')).toMatchObject([
        {
          indices: [0, 7],
          text: '\ud83d\udc68\ud83c\udffe\u200d\ud83e\uddb2'
        }
      ]);
    });

    test('Woman, white haired (light skin tone)', () => {
      expect(parse('\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddb3')).toMatchObject([
        {
          indices: [0, 7],
          text: '\ud83d\udc69\ud83c\udffb\u200d\ud83e\uddb3'
        }
      ]);
    });

    test('Woman superhero', () => {
      expect(parse('\ud83e\uddb8\u200d\u2640\ufe0f')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\uddb8\u200d\u2640\ufe0f'
        }
      ]);
    });

    test('Man supervillian', () => {
      expect(parse('\ud83e\uddb9\u200d\u2642\ufe0f')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\uddb9\u200d\u2642\ufe0f'
        }
      ]);
    });

    test('Party face', () => {
      expect(parse('\ud83e\udd73')).toMatchObject([
        {
          indices: [0, 2],
          text: '\ud83e\udd73'
        }
      ]);
    });

    describe('Chess pawn', () => {
      test('without VS16 is not emoji', () => {
        expect(parse('\u265f')).toEqual([]);
      });

      test('with VS16 is emoji', () => {
        expect(parse('\u265f\ufe0f')).toMatchObject([
          {
            indices: [0, 2],
            text: '\u265f\ufe0f'
          }
        ]);
      });
    });
  });

  describe('Emoji 12.0', () => {
    describe('Holding Hands', () => {
      describe('people', () => {
        test('non-modified', () => {
          expect(parse('\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1')).toMatchObject([
            {
              indices: [0, 8],
              text: '\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1'
            }
          ]);
        });

        test('with same skin tones', () => {
          expect(parse('\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd')).toMatchObject([
            {
              indices: [0, 12],
              text: '\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd'
            }
          ]);
        });

        test('with different skin tones', () => {
          expect(parse('\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb')).toMatchObject([
            {
              indices: [0, 12],
              text: '\ud83e\uddd1\ud83c\udfff\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffb'
            }
          ]);
        });

        test('with unsorted different skin tones are unrecognized', () => {
          expect(parse('\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc')).toMatchObject([
            { text: '\ud83e\uddd1\ud83c\udffb' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83e\uddd1\ud83c\udffc' }
          ]);
          expect(parse('\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd')).toMatchObject([
            { text: '\ud83e\uddd1\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83e\uddd1\ud83c\udffd' }
          ]);
          expect(parse('\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe')).toMatchObject([
            { text: '\ud83e\uddd1\ud83c\udffd' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83e\uddd1\ud83c\udffe' }
          ]);
          expect(parse('\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff')).toMatchObject([
            { text: '\ud83e\uddd1\ud83c\udffe' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83e\uddd1\ud83c\udfff' }
          ]);
        });

        test('mixed modified and non-modified couples are unrecognized', () => {
          expect(parse('\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1')).toMatchObject([
            { text: '\ud83e\uddd1\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83e\uddd1' }
          ]);
          expect(parse('\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc')).toMatchObject([
            { text: '\ud83e\uddd1\u200d\ud83e\udd1d\u200d\ud83e\uddd1' },
            { text: '\ud83c\udffc' }
          ]);
        });
      });

      describe('woman & woman', () => {
        test('non-modified', () => {
          expect(parse('\ud83d\udc6d')).toMatchObject([
            {
              indices: [0, 2],
              text: '\ud83d\udc6d'
            }
          ]);
        });

        test('with same skin tone', () => {
          expect(parse('\ud83d\udc6d\ud83c\udffd')).toMatchObject([
            {
              indices: [0, 4],
              text: '\ud83d\udc6d\ud83c\udffd'
            }
          ]);
        });

        test('with non-canonical same skin tone is unrecognized', () => {
          expect(parse('\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffd' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udffd' }
          ]);
        });

        test('with different skin tones', () => {
          expect(parse('\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc')).toMatchObject([
            {
              indices: [0, 12],
              text: '\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc'
            }
          ]);
        });

        test('with unsorted different skin tones are unrecognized', () => {
          expect(parse('\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffb' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udffc' }
          ]);
          expect(parse('\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udffd' }
          ]);
          expect(parse('\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffd' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udffe' }
          ]);
          expect(parse('\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udfff')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffe' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udfff' }
          ]);
        });

        test('non-canonical non-modified is unrecognized', () => {
          expect(parse('\ud83d\udc69\u200d\ud83e\udd1d\u200d\ud83d\udc69')).toMatchObject([
            { text: '\ud83d\udc69' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69' }
          ]);
        });

        test('mixed modified and non-modified couples are unrecognized', () => {
          expect(parse('\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69' }
          ]);
          expect(parse('\ud83d\udc69\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc')).toMatchObject([
            { text: '\ud83d\udc69' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udffc' }
          ]);
        });
      });

      describe('woman & man', () => {
        test('non-modified', () => {
          expect(parse('\ud83d\udc6b')).toMatchObject([
            {
              indices: [0, 2],
              text: '\ud83d\udc6b'
            }
          ]);
        });

        test('with same skin tone', () => {
          expect(parse('\ud83d\udc6b\ud83c\udffd')).toMatchObject([
            {
              indices: [0, 4],
              text: '\ud83d\udc6b\ud83c\udffd'
            }
          ]);
        });

        test('with non-canonical same skin tone is unrecognized', () => {
          expect(parse('\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffd' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffd' }
          ]);
        });

        test('with different skin tones', () => {
          expect(parse('\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc')).toMatchObject([
            {
              indices: [0, 12],
              text: '\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc'
            }
          ]);
        });

        test('with unsorted different skin tones', () => {
          expect(parse('\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe')).toMatchObject([
            {
              indices: [0, 12],
              text: '\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe'
            }
          ]);
        });

        test('with man first is unrecognized', () => {
          expect(parse('\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc69\ud83c\udffe' }
          ]);
        });

        test('non-canonical non-modified is unrecognized', () => {
          expect(parse('\ud83d\udc69\u200d\ud83e\udd1d\u200d\ud83d\udc68')).toMatchObject([
            { text: '\ud83d\udc69' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68' }
          ]);
        });

        test('mixed modified and non-modified couples are unrecognized', () => {
          expect(parse('\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68')).toMatchObject([
            { text: '\ud83d\udc69\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68' }
          ]);
          expect(parse('\ud83d\udc69\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc')).toMatchObject([
            { text: '\ud83d\udc69' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffc' }
          ]);
        });
      });

      describe('man & man', () => {
        test('non-modified', () => {
          expect(parse('\ud83d\udc6c')).toMatchObject([
            {
              indices: [0, 2],
              text: '\ud83d\udc6c'
            }
          ]);
        });

        test('with same skin tone', () => {
          expect(parse('\ud83d\udc6c\ud83c\udffd')).toMatchObject([
            {
              indices: [0, 4],
              text: '\ud83d\udc6c\ud83c\udffd'
            }
          ]);
        });

        test('with non-canonical same skin tone is unrecognized', () => {
          expect(parse('\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffd' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffd' }
          ]);
        });

        test('with different skin tones', () => {
          expect(parse('\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc')).toMatchObject([
            {
              indices: [0, 12],
              text: '\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc'
            }
          ]);
        });

        test('with unsorted different skin tones are unrecognized', () => {
          expect(parse('\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffb' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffc' }
          ]);
          expect(parse('\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffd' }
          ]);
          expect(parse('\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffd' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffe' }
          ]);
          expect(parse('\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffe' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udfff' }
          ]);
        });

        test('non-canonical non-modified is unrecognized', () => {
          expect(parse('\ud83d\udc68\u200d\ud83e\udd1d\u200d\ud83d\udc68')).toMatchObject([
            { text: '\ud83d\udc68' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68' }
          ]);
        });

        test('mixed modified and non-modified couples are unrecognized', () => {
          expect(parse('\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68')).toMatchObject([
            { text: '\ud83d\udc68\ud83c\udffc' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68' }
          ]);
          expect(parse('\ud83d\udc68\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc')).toMatchObject([
            { text: '\ud83d\udc68' },
            { text: '\ud83e\udd1d' },
            { text: '\ud83d\udc68\ud83c\udffc' }
          ]);
        });
      });
    });
  });
});
