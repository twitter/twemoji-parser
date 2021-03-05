package com.twitter.emoji.config

import org.junit.runner.RunWith
import org.scalatest.wordspec.AnyWordSpec
import org.scalatest.matchers.must.Matchers
import org.scalatestplus.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class YamlParserSpec extends AnyWordSpec with Matchers {
  "YamlParser" which {
    val config = YamlParser(YamlParserSpec.TestYaml)

    "give correct categories" in {
      config.categories must equal(
        Seq(
          Category(
            "foo",
            "Foo",
            Seq(
              Item(
                CodePoints(Seq(0x1f604)),
                "Smiling face with open mouth and smiling eyes",
                EmojiType.Normal,
                keywords = Some("happy,smiling,face")
              ),
              Item(CodePoints(Seq(0x2b50)),
                   "White medium star",
                   EmojiType.Variant),
              Item(CodePoints(Seq(0x23, 0x20e3)),
                   "Keycap hash",
                   EmojiType.Keycap),
              Item(
                CodePoints(Seq(0x1f1e6)),
                "Regional indicator symbol letter a",
                EmojiType.Regional
              ),
              Item(CodePoints(Seq(0x1f1e8, 0x1f1e6), false),
                   "Flag of Canada",
                   EmojiType.Flag,
                   true),
              Item(CodePoints(Seq(0x1f476)),
                   "Baby",
                   EmojiType.Diversity,
                   false),
              Item(CodePoints(Seq(0x261d)),
                   "White up pointing index",
                   EmojiType.VariantDiversity),
              Item(
                CodePoints(Seq(0x1f469, 0x200d, 0x2764, 0xfe0f, 0x200d, 0x1f48b,
                  0x200d, 0x1f468)),
                "Kiss (woman, man)",
                EmojiType.Normal
              ),
              Item(
                CodePoints(Seq(0x1f9d1, 0x200d, 0x1f384)),
                "Mx Claus",
                EmojiType.Diversity,
                false,
                Some("activity,celebration,christmas,santa,claus")
              )
            )
          ),
          Category(
            "skin_tones",
            "Emoji with skin tone",
            Seq(
              Item(CodePoints(Seq(0x1f60f)),
                   "Smirking face",
                   EmojiType.Diversity),
              Item(CodePoints(Seq(0x1f611)),
                   "Expressionless face",
                   EmojiType.Normal)
            )
          ),
          Category(
            "bar",
            YamlParserSpec.EscapableText,
            Seq(
              Item(
                CodePoints(Seq(0x24)),
                YamlParserSpec.EscapableText,
                EmojiType.Normal,
                false,
                Some(YamlParserSpec.EscapableText)
              )
            )
          )
        )
      )
    }

    "diversity codepoints" in {
      val items = config.categories(1).items
      items(0).diversitySequences must equal(
        Seq(
          CodePoints(Seq(0x1f60f)),
          CodePoints(Seq(0x1f60f, 0x1f3fb)),
          CodePoints(Seq(0x1f60f, 0x1f3fc)),
          CodePoints(Seq(0x1f60f, 0x1f3fd)),
          CodePoints(Seq(0x1f60f, 0x1f3fe)),
          CodePoints(Seq(0x1f60f, 0x1f3ff))
        )
      )
      items(1).diversitySequences must equal(Seq(CodePoints(Seq(0x1f611))))
    }

    "generates string and key for codepoints" in {
      val codepoints = CodePoints(Seq(0x1f60f, 0x1f3fd))
      codepoints.str must equal("\ud83d\ude0f\ud83c\udffd")
      codepoints.key must equal("1f60f-1f3fd")
    }

    "Item#escapedDescriptionForScala escapes \\\\, \\\", and \\t" in {
      config.categories.last.items.head.escapedDescriptionForScala must equal(
        "A \\\\ weird \\\"\\\"\\\"\\\" description \\t '"
      )
    }

    "Item#escapedDescriptionForJs escapes \\\\, \\\", and \\t" in {
      config.categories.last.items.head.escapedDescriptionForJs must equal(
        "A \\\\ weird \"\"\"\" description \\t \\'"
      )
    }
  }

  "Multi-Diversity Parsing" which {
    "handles emoji where same skin matches non-specified, sorted" in {
      YamlParser(s"""
- id: multi_diversity
  title: Emoji with more than one skin tone
  items:
  - unicode: "1f46c"
    description: "Two men holding hands"
    keywords: "couple,hand,hold,man,male,men,pride,lgbt,gay"
    type: multi-diversity
    multi_diversity_base_same: 1f46c-skintone
    multi_diversity_base_different: 1f468-skintone-200d-1f91d-200d-1f468-skintone
    multi_diversity_base_different_is_sorted: true
      """).categories(0).items(0).diversitySequences must equal(
        Seq(
          CodePoints(Seq(0x1f46c)),
          CodePoints(Seq(0x1f46c, 0x1f3ff)),
          CodePoints(
            Seq(0x1f468, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fe)),
          CodePoints(
            Seq(0x1f468, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fd)),
          CodePoints(
            Seq(0x1f468, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(
            Seq(0x1f468, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(Seq(0x1f468, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f46c, 0x1f3fe)),
          CodePoints(
            Seq(0x1f468, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fd)),
          CodePoints(
            Seq(0x1f468, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(
            Seq(0x1f468, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(Seq(0x1f468, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f468, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3fe),
                     false),
          CodePoints(Seq(0x1f46c, 0x1f3fd)),
          CodePoints(
            Seq(0x1f468, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(
            Seq(0x1f468, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(Seq(0x1f468, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f468, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3fe),
                     false),
          CodePoints(Seq(0x1f468, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3fd),
                     false),
          CodePoints(Seq(0x1f46c, 0x1f3fc)),
          CodePoints(
            Seq(0x1f468, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(Seq(0x1f468, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f468, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3fe),
                     false),
          CodePoints(Seq(0x1f468, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3fd),
                     false),
          CodePoints(Seq(0x1f468, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468,
                       0x1f3fc),
                     false),
          CodePoints(Seq(0x1f46c, 0x1f3fb))
        )
      )
    }

    "handles emoji where same skin matches non-specified, unsorted" in {
      YamlParser(s"""
- id: multi_diversity
  title: Emoji with more than one skin tone
  items:
  - unicode: "1f46b"
    description: "Man and woman holding hands"
    keywords: "couple,hand,hold,man,woman,male,female,men,women"
    type: multi-diversity
    multi_diversity_base_same: 1f46b-skintone
    multi_diversity_base_different: 1f469-skintone-200d-1f91d-200d-1f468-skintone
      """).categories(0).items(0).diversitySequences must equal(
        Seq(
          CodePoints(Seq(0x1f46b)),
          CodePoints(Seq(0x1f46b, 0x1f3ff)),
          CodePoints(
            Seq(0x1f469, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fe)),
          CodePoints(
            Seq(0x1f469, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fd)),
          CodePoints(
            Seq(0x1f469, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(
            Seq(0x1f469, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(
            Seq(0x1f469, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3ff)),
          CodePoints(Seq(0x1f46b, 0x1f3fe)),
          CodePoints(
            Seq(0x1f469, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fd)),
          CodePoints(
            Seq(0x1f469, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(
            Seq(0x1f469, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(
            Seq(0x1f469, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3ff)),
          CodePoints(
            Seq(0x1f469, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fe)),
          CodePoints(Seq(0x1f46b, 0x1f3fd)),
          CodePoints(
            Seq(0x1f469, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(
            Seq(0x1f469, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(
            Seq(0x1f469, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3ff)),
          CodePoints(
            Seq(0x1f469, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fe)),
          CodePoints(
            Seq(0x1f469, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fd)),
          CodePoints(Seq(0x1f46b, 0x1f3fc)),
          CodePoints(
            Seq(0x1f469, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fb)),
          CodePoints(
            Seq(0x1f469, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3ff)),
          CodePoints(
            Seq(0x1f469, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fe)),
          CodePoints(
            Seq(0x1f469, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fd)),
          CodePoints(
            Seq(0x1f469, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f468, 0x1f3fc)),
          CodePoints(Seq(0x1f46b, 0x1f3fb))
        )
      )
    }

    "handles emoji where same skin matches multi skin, sorted" in {
      YamlParser(s"""
- id: multi_diversity
  title: Emoji with more than one skin tone
  items:
  - unicode: "1f9d1-200d-1f91d-200d-1f9d1"
    description: "Two people holding hands"
    keywords: "couple,hand,hold"
    type: multi-diversity
    multi_diversity_base_same: 1f9d1-skintone-200d-1f91d-200d-1f9d1-skintone
    multi_diversity_base_different: 1f9d1-skintone-200d-1f91d-200d-1f9d1-skintone
    multi_diversity_base_different_is_sorted: true
      """).categories(0).items(0).diversitySequences must equal(
        Seq(
          CodePoints(Seq(0x1f9d1, 0x200d, 0x1f91d, 0x200d, 0x1f9d1)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3ff)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fe)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fd)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fc)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3ff, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fb)),
          CodePoints(Seq(0x1f9d1, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3ff),
                     false),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fe)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fd)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fc)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fe, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fb)),
          CodePoints(Seq(0x1f9d1, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f9d1, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3fe),
                     false),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fd)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fc)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fd, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fb)),
          CodePoints(Seq(0x1f9d1, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f9d1, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3fe),
                     false),
          CodePoints(Seq(0x1f9d1, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3fd),
                     false),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fc)),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fc, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fb)),
          CodePoints(Seq(0x1f9d1, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3ff),
                     false),
          CodePoints(Seq(0x1f9d1, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3fe),
                     false),
          CodePoints(Seq(0x1f9d1, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3fd),
                     false),
          CodePoints(Seq(0x1f9d1, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f9d1,
                       0x1f3fc),
                     false),
          CodePoints(
            Seq(0x1f9d1, 0x1f3fb, 0x200d, 0x1f91d, 0x200d, 0x1f9d1, 0x1f3fb))
        )
      )
    }
  }
}

object YamlParserSpec {
  val EscapableText = "A \\ weird \"\"\"\" description \t '"
  val TestYaml = s"""
- id: foo
  title: Foo
  items:
  - unicode: "1f604"
    description: "Smiling face with open mouth and smiling eyes"
    keywords: "happy,smiling,face"
  - unicode: "2b50"
    description: "White medium star"
    type: variant
  - unicode: "23-20e3"
    description: "Keycap hash"
    type: keycap
  - unicode: "1f1e6"
    description: "Regional indicator symbol letter a"
    type: regional
  - unicode: "1f1e8-1f1e6"
    description: "Flag of Canada"
    type: flag
    exclude_from_picker: true
  - unicode: "1f476"
    description: "Baby"
    type: "diversity"
    exclude_from_picker: false
  - unicode: "261d"
    description: "White up pointing index"
    type: "variant,diversity"
  - unicode: "1f469-200d-2764-fe0f-200d-1f48b-200d-1f468"
    description: "Kiss (woman, man)"
  - unicode: "1f9d1-200d-1f384"
    description: "Mx Claus"
    keywords: "activity,celebration,christmas,santa,claus"
    type: "diversity"
    gender_complements: "1f936,1f385"
- id: skin_tones
  title: Emoji with skin tone
  items:
  - unicode: "1f60f"
    description: "Smirking face"
    type: "diversity"
  - unicode: "1f611"
    description: "Expressionless face"
- id: bar
  title: $EscapableText
  items:
  - unicode: "24"
    description: $EscapableText
    keywords: $EscapableText
  """
}
