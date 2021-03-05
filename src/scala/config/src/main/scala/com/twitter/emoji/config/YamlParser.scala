package com.twitter.emoji.config

import java.util.{List => JList, Map => JMap}

import org.yaml.snakeyaml.Yaml

import scala.collection.JavaConverters._

object EmojiType extends Enumeration {
  val Normal, Keycap, Flag, Regional, Variant, Diversity, VariantDiversity,
  TextDefault, MultiDiversity = Value

  private val lookup = Map[String, Value](
    "keycap" -> Keycap,
    "flag" -> Flag,
    "regional" -> Regional,
    "variant" -> Variant,
    "diversity" -> Diversity,
    "variant,diversity" -> VariantDiversity,
    "text-default" -> TextDefault,
    "multi-diversity" -> MultiDiversity
  )

  def apply(string: String): Value = lookup(string)

  val VariantTypes = Seq(Variant, VariantDiversity)
  val SingleDiversityTypes = Seq(Diversity, VariantDiversity)
  val DiversityTypes = Seq(Diversity, VariantDiversity, MultiDiversity)
}

object YamlParser {
  case class Config(
      categories: Seq[Category]
  )

  val SkinTones = Seq(
    0x1f3fb,
    0x1f3fc,
    0x1f3fd,
    0x1f3fe,
    0x1f3ff
  )

  // Zero width joiner char, see http://unicode.org/reports/tr51/#Emoji_ZWJ_Sequences
  val Zwj = 0x200d
  // Force Emoji rendering, see http://unicode.org/reports/tr51/#Emoji_Variation_Sequences
  val VS16 = 0xfe0f

  def apply(source: String): Config = {
    // Shimmed out version of internal com.twitter.config.yaml.YamlLoader
    // so all of Twemoji can be open-sourced
    val yamlLoader = new Yaml
    val yaml = try {
      yamlLoader.load(source)
    } catch {
      case _: ClassCastException => {
        val resource = getClass.getResourceAsStream(source)
        val loadedYaml = yamlLoader.load[JList[JMap[String, Any]]](resource)
        resource.close()
        loadedYaml
      }
    }

    // collect all the items lists within the top-level elements
    val categories = yaml.asScala.map { category =>
      val id = category.get("id").asInstanceOf[String]
      val title = category.get("title").asInstanceOf[String]
      val items = category
        .get("items")
        .asInstanceOf[JList[JMap[String, Any]]]
        .asScala
        .map { item =>
          val codepoints =
            item.get("unicode").asInstanceOf[String].split("-").map { v =>
              Integer.parseInt(v, 16)
            }
          val emojiType = Option(item.get("type").asInstanceOf[String])
            .map { EmojiType(_) }
            .getOrElse(EmojiType.Normal)
          // In this yaml reader, Boolean defaults to false when item not present.
          // Casting to a String to check for null is not allowed
          val excludeFromPicker =
            item.get("exclude_from_picker").asInstanceOf[Boolean]
          val multiDiversityConfig =
            if (emojiType == EmojiType.MultiDiversity)
              Some(
                MultiDiversityConfig(
                  item.get("multi_diversity_base_same").asInstanceOf[String],
                  item
                    .get("multi_diversity_base_different")
                    .asInstanceOf[String],
                  item
                    .get("multi_diversity_base_different_is_sorted")
                    .asInstanceOf[Boolean]
                ))
            else None

          Item(
            codepoints = CodePoints(codepoints, !excludeFromPicker),
            description = item.get("description").asInstanceOf[String],
            emojiType = emojiType,
            excludeFromPicker = excludeFromPicker,
            keywords = Option(item.get("keywords").asInstanceOf[String]),
            multiDiversityConfig = multiDiversityConfig
          )
        }
      Category(
        id = id,
        title = title,
        items = items
      )
    }
    Config(categories)
  }
}

case class CodePoints(val cp: Seq[Int], val includeInPicker: Boolean = true) {
  def key = cp.map { Integer.toHexString(_) }.mkString("-")
  def str = cp.flatMap { Character.toChars(_) }.mkString
}
