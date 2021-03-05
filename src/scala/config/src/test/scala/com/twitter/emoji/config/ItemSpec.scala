package com.twitter.emoji.config

import org.junit.runner.RunWith
import org.scalatest.wordspec.AnyWordSpec
import org.scalatest.matchers.must.Matchers
import org.scalatestplus.junit.JUnitRunner
import com.twitter.emoji.config.EmojiType._

@RunWith(classOf[JUnitRunner])
class ItemSpec extends AnyWordSpec with Matchers {
  private def getItem(
      cp: String,
      emojiType: EmojiType.Value,
      multiDiversityConfig: Option[MultiDiversityConfig] = None): Item =
    new Item(
      codepoints = CodePoints(cp.split("-").map { v =>
        Integer.parseInt(v, 16)
      }),
      description = "",
      emojiType = emojiType,
      multiDiversityConfig = multiDiversityConfig
    )

  def getText(cps: Int*): String = CodePoints(cps).str
  val VS16 = YamlParser.VS16
  val ZWJ = YamlParser.Zwj

  "Item" must {
    "define sprite info" which {
      "With skin tone variant" which {
        val defaultItem = getItem("1f575", EmojiType.Diversity)
        val mockSpriteSheet = Map(
          "1f575" -> new Tuple2(1, 1),
          "1f575-1f3fb" -> new Tuple2(2, 2),
          "1f575-1f3fc" -> new Tuple2(3, 3),
          "1f575-1f3fd" -> new Tuple2(4, 4),
          "1f575-1f3fe" -> new Tuple2(5, 5),
          "1f575-1f3ff" -> new Tuple2(6, 6)
        )

        "extracts base emoji sprite position" in {
          val itemWithSpriteInfo = Item(defaultItem, mockSpriteSheet)
          itemWithSpriteInfo.spritePosition must equal(
            Some(SpritePosition(1, 1)))
        }

        "extracts skin tone variant sprite positions" in {
          val itemWithSpriteInfo = Item(defaultItem, mockSpriteSheet)
          itemWithSpriteInfo.skinToneVariants.map(_.spritePosition) must equal(
            Seq(
              SpritePosition(2, 2),
              SpritePosition(3, 3),
              SpritePosition(4, 4),
              SpritePosition(5, 5),
              SpritePosition(6, 6)
            ))
        }
      }

      "Without skin tone variant" which {
        val defaultItem = getItem("1f92d", EmojiType.Normal)
        val mockSpriteSheet = Map(
          "1f92d" -> new Tuple2(1, 1)
        )
        "does not contain skin tone variants" in {
          val item = Item(defaultItem, mockSpriteSheet)
          item.skinToneVariants must equal(Seq())
        }
      }

      "for multi-diversity emoji" which {
        "includes unsorted skinToneVariants" in {
          val item =
            Item(getItem("1f46b",
                         MultiDiversity,
                         Some(
                           MultiDiversityConfig(
                             "1f46b-skintone",
                             "1f469-skintone-200d-1f91d-200d-1f468-skintone",
                             false
                           ))),
                 Map())
          item.skinToneVariants.map(_.text) must equal(
            Seq(
              getText(0x1f46b, 0x1f3ff),
              getText(0x1f469, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fe),
              getText(0x1f469, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fd),
              getText(0x1f469, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f469, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f469, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3ff),
              getText(0x1f46b, 0x1f3fe),
              getText(0x1f469, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fd),
              getText(0x1f469, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f469, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f469, 0x1f3fd, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3ff),
              getText(0x1f469, 0x1f3fd, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fe),
              getText(0x1f46b, 0x1f3fd),
              getText(0x1f469, 0x1f3fd, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f469, 0x1f3fd, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f469, 0x1f3fc, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3ff),
              getText(0x1f469, 0x1f3fc, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fe),
              getText(0x1f469, 0x1f3fc, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fd),
              getText(0x1f46b, 0x1f3fc),
              getText(0x1f469, 0x1f3fc, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f469, 0x1f3fb, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3ff),
              getText(0x1f469, 0x1f3fb, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fe),
              getText(0x1f469, 0x1f3fb, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fd),
              getText(0x1f469, 0x1f3fb, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f46b, 0x1f3fb)
            ))
        }

        "doesn't include unsorted skinToneVariants" in {
          val item =
            Item(getItem("1f46c",
                         MultiDiversity,
                         Some(
                           MultiDiversityConfig(
                             "1f46c-skintone",
                             "1f468-skintone-200d-1f91d-200d-1f468-skintone",
                             true
                           ))),
                 Map())
          item.skinToneVariants.map(_.text) must equal(
            Seq(
              getText(0x1f46c, 0x1f3ff),
              getText(0x1f468, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fe),
              getText(0x1f468, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fd),
              getText(0x1f468, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f468, 0x1f3ff, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f46c, 0x1f3fe),
              getText(0x1f468, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fd),
              getText(0x1f468, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f468, 0x1f3fe, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f46c, 0x1f3fd),
              getText(0x1f468, 0x1f3fd, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fc),
              getText(0x1f468, 0x1f3fd, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f46c, 0x1f3fc),
              getText(0x1f468, 0x1f3fc, ZWJ, 0x1f91d, ZWJ, 0x1f468, 0x1f3fb),
              getText(0x1f46c, 0x1f3fb)
            ))
        }
      }
    }

    "have fully qualified text" which {
      "for types that require VS16" which {
        s"for $Variant" in {
          val variantItem = getItem("26d1", Variant)
          variantItem.text must equal(getText(0x26d1, VS16))
        }

        s"for $TextDefault" in {
          val textDefaultItem = getItem("265f", TextDefault)
          textDefaultItem.text must equal(getText(0x265f, VS16))
        }

        s"for $VariantDiversity" in {
          val defaultItem = getItem("270c", VariantDiversity)
          val variantDiversityItem = Item(defaultItem, Map())
          variantDiversityItem.text must equal(getText(0x270c, VS16))
          variantDiversityItem.skinToneVariants.map(_.text) must equal(
            Seq(
              getText(0x270c, VS16, 0x1f3fb),
              getText(0x270c, VS16, 0x1f3fc),
              getText(0x270c, VS16, 0x1f3fd),
              getText(0x270c, VS16, 0x1f3fe),
              getText(0x270c, VS16, 0x1f3ff)
            ))
        }
      }
      "for types that do not require VS16" which {
        Seq(Normal, Keycap, Flag, Regional).foreach { emojiType =>
          s"for $emojiType" in {
            val item = getItem("265f", emojiType)
            item.text must equal(getText(0x265f))
          }
        }

        s"for $Diversity" in {
          val defaultItem = getItem("270c", Diversity)
          val variantDiversityItem = Item(defaultItem, Map())
          variantDiversityItem.text must equal(getText(0x270c))
          variantDiversityItem.skinToneVariants.map(_.text) must equal(
            Seq(
              getText(0x270c, 0x1f3fb),
              getText(0x270c, 0x1f3fc),
              getText(0x270c, 0x1f3fd),
              getText(0x270c, 0x1f3fe),
              getText(0x270c, 0x1f3ff)
            ))
        }
      }
    }

    "have maxCodePointSequenceLength" which {
      Seq(Normal, Keycap, Flag, Regional).foreach { emojiType =>
        "adds zero to base codepoint length for " + emojiType in {
          getItem("1f606", emojiType).maxCodePointSequenceLength must be(1)
          getItem("1f606-1f607", emojiType).maxCodePointSequenceLength must be(
            2)
        }
      }

      Seq(Variant, Diversity, TextDefault).foreach { emojiType =>
        "adds one to base codepoint length for " + emojiType in {
          getItem("1f606", emojiType).maxCodePointSequenceLength must be(2)
          getItem("1f606-1f607", emojiType).maxCodePointSequenceLength must be(
            3)
        }
      }

      Seq(VariantDiversity).foreach { emojiType =>
        "adds two to base codepoint length for " + emojiType in {
          getItem("1f606", emojiType).maxCodePointSequenceLength must be(3)
          getItem("1f606-1f607", emojiType).maxCodePointSequenceLength must be(
            4)
        }
      }

      "finds the longest sequence for MultiDiversity" in {
        getItem("1f46b",
                MultiDiversity,
                Some(
                  MultiDiversityConfig(
                    "1f46b-skintone",
                    "1f469-skintone-200d-1f91d-200d-1f468-skintone",
                    false
                  ))).maxCodePointSequenceLength must be(7)
      }
    }
  }
}
