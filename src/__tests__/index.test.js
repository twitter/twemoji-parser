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
          url: 'https://twemoji.maxcdn.com/v/latest/svg/2764.svg'
        }
      ]);
    });

    test('can ask for MaxCDN PNGs', () => {
      expect(parse('I \u2764 emoji!', { assetType: 'png' })).toMatchObject([
        {
          url: 'https://twemoji.maxcdn.com/v/latest/72x72/2764.png'
        }
      ]);
    });

    test('non-png assetType defaults back to SVG', () => {
      expect(parse('I \u2764 emoji!', { assetType: 'foobar' })).toMatchObject([
        {
          url: 'https://twemoji.maxcdn.com/v/latest/svg/2764.svg'
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

        test('with unsorted different skin tones', () => {
          expect(parse('\ud83e\uddd1\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffc')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83e\uddd1\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffd')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83e\uddd1\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udffe')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83e\uddd1\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83e\uddd1\ud83c\udfff')).toMatchObject([
            { indices: [0, 12] }
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

        test('with unsorted different skin tones', () => {
          expect(parse('\ud83d\udc69\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffc')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83d\udc69\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffd')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83d\udc69\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udffe')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83d\udc69\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc69\ud83c\udfff')).toMatchObject([
            { indices: [0, 12] }
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

        test('with unsorted different skin tones', () => {
          expect(parse('\ud83d\udc68\ud83c\udffb\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffc')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83d\udc68\ud83c\udffc\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffd')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83d\udc68\ud83c\udffd\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udffe')).toMatchObject([
            { indices: [0, 12] }
          ]);
          expect(parse('\ud83d\udc68\ud83c\udffe\u200d\ud83e\udd1d\u200d\ud83d\udc68\ud83c\udfff')).toMatchObject([
            { indices: [0, 12] }
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

  describe('Emoji 12.1', () => {
    test('trans flag', () => {
      expect(parse('\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f')).toMatchObject([
        {
          indices: [0, 6],
          text: '\ud83c\udff3\ufe0f\u200d\u26a7\ufe0f'
        }
      ]);
    });

    describe('trans symbol', () => {
      test('with vs16', () => {
        expect(parse('\u26a7\ufe0f')).toMatchObject([
          {
            indices: [0, 2],
            text: '\u26a7\ufe0f'
          }
        ]);
      });

      test('without vs16', () => {
        expect(parse('\u26a7')).toMatchObject([
          {
            indices: [0, 1],
            text: '\u26a7'
          }
        ]);
      });
    });

    describe('gender-neutral sequences', () => {
      const genderNeutralEmoji = [
        { name: 'person, red haired', text: '\ud83e\uddd1\u200d\ud83e\uddb0' },
        { name: 'person, curly hair, light skin tone', text: '\ud83e\uddd1\ud83c\udffb\u200d\ud83e\uddb1' },
        { name: 'person, white hair, dark skin tone', text: '\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddb3' },
        { name: 'person, bald, medium skin tone', text: '\ud83e\uddd1\ud83c\udffd\u200d\ud83e\uddb2' },
        { name: 'health worker', text: '\ud83e\uddd1\u200d\u2695\ufe0f' },
        { name: 'student, light skin tone', text: '\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udf93' },
        { name: 'teacher, medium-light skin tone', text: '\ud83e\uddd1\ud83c\udffc\u200d\ud83c\udfeb' },
        { name: 'judge, medium skin tone', text: '\ud83e\uddd1\ud83c\udffd\u200d\u2696\ufe0f' },
        { name: 'farmer, medium-dark skin tone', text: '\ud83e\uddd1\ud83c\udffe\u200d\ud83c\udf3e' },
        { name: 'cook, dark skin tone', text: '\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udf73' },
        { name: 'mechanic', text: '\ud83e\uddd1\u200d\ud83d\udd27' },
        { name: 'factory worker, light skin tone', text: '\ud83e\uddd1\ud83c\udffb\u200d\ud83c\udfed' },
        { name: 'office worker, medium-light skin tone', text: '\ud83e\uddd1\ud83c\udffc\u200d\ud83d\udcbc' },
        { name: 'scientist, medium skin tone', text: '\ud83e\uddd1\ud83c\udffd\u200d\ud83d\udd2c' },
        { name: 'technologist, medium-dark skin tone', text: '\ud83e\uddd1\ud83c\udffe\u200d\ud83d\udcbb' },
        { name: 'singer, dark skin tone', text: '\ud83e\uddd1\ud83c\udfff\u200d\ud83c\udfa4' },
        { name: 'artist', text: '\ud83e\uddd1\u200d\ud83c\udfa8' },
        { name: 'pilot, light skin tone', text: '\ud83e\uddd1\ud83c\udffb\u200d\u2708\ufe0f' },
        { name: 'astronaut, medium-light skin tone', text: '\ud83e\uddd1\ud83c\udffc\u200d\ud83d\ude80' },
        { name: 'firefighter, medium skin tone', text: '\ud83e\uddd1\ud83c\udffd\u200d\ud83d\ude92' },
        { name: 'person with probing cane, medium-dark skin tone', text: '\ud83e\uddd1\ud83c\udffe\u200d\ud83e\uddaf' },
        { name: 'person in motorized wheelchair, dark skin tone', text: '\ud83e\uddd1\ud83c\udfff\u200d\ud83e\uddbc' },
        { name: 'person in manual wheelchair', text: '\ud83e\uddd1\u200d\ud83e\uddbd' }
      ];

      for (const { name, text } of genderNeutralEmoji) {
        test(name, () => {
          expect(parse(text)).toMatchObject([{ text }]);
        });
      }
    });
  });

  describe('Emoji 13.0', () => {
    test('Mx Claus', () => {
      expect(parse('\ud83e\uddd1\u200d\ud83c\udf84')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\uddd1\u200d\ud83c\udf84'
        }
      ]);
    });

    test('black cat', () => {
      expect(parse('\ud83d\udc08\u200d\u2b1b')).toMatchObject([
        {
          indices: [0, 4],
          text: '\ud83d\udc08\u200d\u2b1b'
        }
      ]);
    });

    test('polar bear', () => {
      expect(parse('\ud83d\udc3b\u200d\u2744\ufe0f')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83d\udc3b\u200d\u2744\ufe0f'
        }
      ]);
    });

    test('woman feeding baby', () => {
      expect(parse('\ud83d\udc69\u200d\ud83c\udf7c')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83d\udc69\u200d\ud83c\udf7c'
        }
      ]);
    });

    test('man feeding baby', () => {
      expect(parse('\ud83d\udc68\u200d\ud83c\udf7c')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83d\udc68\u200d\ud83c\udf7c'
        }
      ]);
    });

    test('person feeding baby', () => {
      expect(parse('\ud83e\uddd1\u200d\ud83c\udf7c')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\uddd1\u200d\ud83c\udf7c'
        }
      ]);
    });
  });

  describe('Emoji 13.1', () => {
    test('Face exhaling', () => {
      expect(parse('\ud83d\ude2e\u200d\ud83d\udca8')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83d\ude2e\u200d\ud83d\udca8'
        }
      ]);
    });

    test('Face in clouds', () => {
      expect(parse('\ud83d\ude36\u200d\ud83c\udf2b\ufe0f')).toMatchObject([
        {
          indices: [0, 6],
          text: '\ud83d\ude36\u200d\ud83c\udf2b\ufe0f'
        }
      ]);
    });

    test('Bearded woman', () => {
      expect(parse('\ud83e\uddd4\u200d\u2640\ufe0f')).toMatchObject([
        {
          indices: [0, 5],
          text: '\ud83e\uddd4\u200d\u2640\ufe0f'
        }
      ]);
    });

    test('Couple with heart and different skintones', () => {
      expect(parse('\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb')).toMatchObject([
        {
          indices: [0, 12],
          text: '\ud83d\udc69\ud83c\udffd\u200d\u2764\ufe0f\u200d\ud83d\udc69\ud83c\udffb'
        }
      ]);
    });

    test('Couple kissing with different skintones', () => {
      expect(
        parse('\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd')
      ).toMatchObject([
        {
          indices: [0, 15],
          text: '\ud83d\udc69\ud83c\udffc\u200d\u2764\ufe0f\u200d\ud83d\udc8b\u200d\ud83d\udc69\ud83c\udffd'
        }
      ]);
    });

    test('Heart on fire', () => {
      expect(parse('\u2764\ufe0f\u200d\ud83d\udd25')).toMatchObject([
        {
          indices: [0, 5],
          text: '\u2764\ufe0f\u200d\ud83d\udd25'
        }
      ]);
    });
  });

  describe('Emoji 14.0', () => {
    test('single-codepoint handshake with no skintones', () => {
      expect(parse('\ud83e\udd1d')).toMatchObject([
        {
          indices: [0, 2],
          text: '\ud83e\udd1d'
        }
      ]);
    });

    test('single-codepoint handshake with both hands the same skintone', () => {
      expect(parse('\ud83e\udd1d\ud83c\udffe')).toMatchObject([
        {
          indices: [0, 4],
          text: '\ud83e\udd1d\ud83c\udffe'
        }
      ]);
    });

    test('multi-codepoint handshake with different skintones', () => {
      expect(parse('\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c\udffd')).toMatchObject([
        {
          indices: [0, 9],
          text: '\ud83e\udef1\ud83c\udfff\u200d\ud83e\udef2\ud83c\udffd'
        }
      ]);
    });

    test('multi-codepoint handshake with same skintone is unrecognized', () => {
      expect(parse('\ud83e\udef1\ud83c\udffd\u200d\ud83e\udef2\ud83c\udffd')).toMatchObject([
        {
          indices: [0, 4],
          text: '\ud83e\udef1\ud83c\udffd'
        },
        {
          indices: [5, 9],
          text: '\ud83e\udef2\ud83c\udffd'
        }
      ]);
    });
  });
});
