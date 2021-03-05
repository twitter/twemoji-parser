import com.twitter.emoji.config.{CategoryForInfo, CodePoints, EmojiType, Item, YamlParser}
import com.twitter.emoji.config.Utils.formatMultilineString

object ZwjDiversityType extends Enumeration {
  val LeadingGender, TrailingGenderWithoutVariant, TrailingGenderWithVariant = Value
}

class EmojiInfoGeneratedView(
  source: String,
  quote: String = "\"",
  isUCS2: Boolean = false,
  withVariantSuffix: Boolean = true,
  withExcludedEmojis: Boolean = true,
  emojiSpritePositions: Map[String, (Int, Int)] = Map.empty,
  isOutputObjC: Boolean = false,
  isOutputRuby: Boolean = false,
  rows: Int = 0,
  columns: Int = 0) {
  private val KeycapCodePoint = 0x20e3
  private val ZwjCodePoint = 0x200d
  private val ManCodePoint = 0x1f468
  private val WomanCodePoint = 0x1f469
  private val PersonCodePoint = 0x1f9d1
  private val VS15CodePoint = 0xfe0e
  private val VS16CodePoint = 0xfe0f
  private val FemaleSignCodePoint = 0x2640
  private val MaleSignCodePoint = 0x2642
  private val LightestSkinToneCodePoint = 0x1f3fb
  private val DarkestSkinToneCodePoint = 0x1f3ff

  val keycap = unicodePattern(KeycapCodePoint)
  val zwj = unicodePattern(ZwjCodePoint)
  val vs15 = unicodePattern(VS15CodePoint)
  val vs16 = unicodePattern(VS16CodePoint)

  val skinToneCodePointSequences =
    (LightestSkinToneCodePoint to DarkestSkinToneCodePoint).map(Seq(_))

  val skinToneRegex = regexFromCodepointSequences(skinToneCodePointSequences)
  val skinToneOrVs16Regex = regexFromCodepointSequences(
    Seq(VS16CodePoint) +: skinToneCodePointSequences
  )
  val femaleOrMaleSignRegex = regexFromCodepointSequences(
    Seq(Seq(FemaleSignCodePoint), Seq(MaleSignCodePoint))
  )
  val manWomanPersonRegex = regexFromCodepointSequences(
    Seq(Seq(ManCodePoint), Seq(WomanCodePoint), Seq(PersonCodePoint)))

  private val config = YamlParser(source)
  private val emojiItems = config.categories.flatMap { category =>
    category.items.map { item => Item(item, emojiSpritePositions) }
  }
  private var emojiKeys = Set[String]()
  val allEmojiItems = emojiItems.filterNot(item => {
    if (item.excludeFromPicker && !withExcludedEmojis) {
      true
    } else {
      val seen = emojiKeys(item.key)
      emojiKeys += item.key
      seen
    }
  })
  val (emojiMostItems, emojiLastItem) = allEmojiItems.splitAt(allEmojiItems.size - 1)

  // Create a map of common prefixes -> lists of last items that share the prefix.
  // This is to compact the regex. For example, /abc|abd|abe/ can be /ab[cde]/
  // Input is like Seq(Seq(1, 2, 3), Seq(1, 2, 5), Seq(1, 2, 9),  Seq(8,9), Seq(20))
  // Output is like Map(Seq(1, 2) -> Seq(3, 5 9), Seq(8) -> Seq(9), Nil -> Seq(20))
  def groupLastItemsByPrefix(seq: Seq[Seq[Int]]): Map[Seq[Int], Seq[Int]] = {
    seq.map {
      _.reverse
    } groupBy {
      // The prefix, or seq of all items except the last one
      _.tail.reverse
    } mapValues {
      _.map {
        // Because the seqs are reversed, this sets the values to the last item
        _.head
      }
    }
  }

  // Input is like Seq(1,2,3,4,6,7,9)
  // Output is like Seq((1,4), (6,7), (9,9))
  private def findContiguousSpans(seq: Seq[Int]): Seq[(Int, Int)] = {
    // Walk sorted items, append new items to head, reverse at end
    seq.sorted
      .foldLeft(Seq.empty[(Int, Int)]) {
        // The new value extends the last span added, so continue it.
        case ((start, end) :: tail, value) if (end + 1 == value) => (start, value) +: tail
        // Otherwise, create new span.
        case (spans, value) => (value, value) +: spans
      }
      .reverse
  }

  // Convert to the one or two unicode characters, concatenated into a String
  // Handles UTF-16 surrogate pair expansion. If isOutputObjC is true,
  // will write surrogate pairs in UTF-16 using big-U notation (safe for clang)
  // If isOutputRuby is true, will output formatted properly for ruby.
  // Examples:
  // unicodePattern(0x21) -> "\u0021"
  // unicodePattern(0x1f1e6) -> "\ud83c\udde6"
  // unicodePattern(0x1f1e6) (isOutputObjC) -> "\U0001F1E6"
  // unicodePattern(0x1f1e6) (isOutputRuby) -> "\\u{0001F1E6}"
  private def unicodePattern(v: Int): String = {
    if (v < 0xff) {
      Character
        .toChars(v)
        .mkString
    } else if (v > 0xffff && isOutputObjC) {
      "\\U%08x".format(v).mkString
    } else if (v > 0xffff && isOutputRuby) {
      "\\u{%06x}".format(v).mkString
    } else {
      Character
        .toChars(v)
        .map {
          _.toInt
        }
        .map {
          "\\u%04x".format(_)
        }
        .mkString
    }
  }

  // Converts a sequences of (start,end) tuples into a regex char group string.
  // Input is like Seq((1,4), (6,7), (9,9))
  // Output is like "[1-4679]"
  private def spanString(seq: Seq[(Int, Int)]): String = {
    seq match {
      case Nil => ""

      // Singleton item (no need to make a char group)
      case (start, end) :: Nil if (start == end) => unicodePattern(start)

      // A char group with at least 2 items
      case _ =>
        seq
          .map {
            case (start, end) =>
              if (start == end) {
                // Singleton item in a group
                unicodePattern(start)
              } else if (start + 1 == end) {
                // Adjacent items in a group, no need to make a range
                unicodePattern(start) + unicodePattern(end)
              } else {
                // Range of items in a group
                unicodePattern(start) + "-" + unicodePattern(end)
              }
          }
          .mkString("[", "", "]")
    }
  }

  private def internalRegexFromCodepointSequences(codePointSequences: Seq[Seq[Int]]) = {
    val groupedItems = groupLastItemsByPrefix(codePointSequences)
    val sortedGroupedItems = groupedItems.toSeq.sortBy {
      case (prefix, _) =>
        // Sort by longest prefix first, them alpha of the unicode string.
        (-prefix.length, CodePoints(prefix).str)
    }
    val regexParts = sortedGroupedItems map {
      case (prefix, lastItems) =>
        val joinedItems = prefix.map {
          unicodePattern(_)
        } :+ spanString(findContiguousSpans(lastItems))
        joinedItems.mkString
    }

    // Return something that is a single char or [] class,
    // or a non-capturing group of chars and [] classes "|"ed together.
    if (regexParts.isEmpty) throw new Exception("Regex cannot be empty")
    else if (regexParts.length == 1 && sortedGroupedItems.head._1.isEmpty) regexParts.head
    else regexParts.mkString("(?:", "|", ")")
  }

  def regexFromCodepointSequences(codePointSequences: Seq[Seq[Int]]) = {
    val normalizedCodePointSequences = if (isUCS2) {
      codePointSequences.map(codePointSequence => {
        codePointSequence.flatMap {
          case codePoint if codePoint >= 0x10000 && codePoint < 0x110000 =>
            Seq(
              ((codePoint - 0x10000) >> 10) + 0xd800,
              (codePoint & 0x3ff) + 0xdc00
            )
          case codePoint if codePoint < 0x10000 => Seq(codePoint)
          case _ => Nil
        }
      })
    } else codePointSequences

    internalRegexFromCodepointSequences(normalizedCodePointSequences)
  }

  private val (multiDiversityItems, nonMultiDiversityItems) =
    emojiItems.partition(_.emojiType == EmojiType.MultiDiversity)
  private val (zwjItems, nonZwjItems) = nonMultiDiversityItems.partition(_.hasZeroWidthJoiner)
  private val (zwjDiversityItems, zwjNonDiversityItems) =
    zwjItems.partition(_.emojiType == EmojiType.Diversity)

  zwjItems.foreach {
    case item if item.emojiType == EmojiType.Normal => Unit
    case item if item.emojiType == EmojiType.Diversity => Unit
    case item =>
      throw new Exception(
        s"Zwj diversity item ${item.codepoints.key} has an invalid type (${item.emojiType}). Only diversity is allowed."
      )
  }

  private def verifyGenderComplementExists(
    genderComplementCodepoints: CodePoints,
    item: Item
  ): Unit = {
    if (!zwjDiversityItems.exists(_.codepoints.cp == genderComplementCodepoints.cp)) {
      throw new Exception(
        s"Zwj diversity item ${item.codepoints.key} is missing its gender-complement sequence ${genderComplementCodepoints.key}"
      )
    }
  }

  val multiDiversityCodepointSequences =
    multiDiversityItems.flatMap { item => item.diversitySequences }.map { codepoints =>
      codepoints.cp
    }

  private val zwjDiversityBreakdown = zwjDiversityItems.flatMap { item =>
    item.codepoints.cp match {
      case cp if cp.take(2) == Seq(ManCodePoint, ZwjCodePoint) =>
        verifyGenderComplementExists(CodePoints(WomanCodePoint +: cp.drop(1)), item)
        verifyGenderComplementExists(CodePoints(PersonCodePoint +: cp.drop(1)), item)
        None
      case cp if cp.take(2) == Seq(WomanCodePoint, ZwjCodePoint) =>
        verifyGenderComplementExists(CodePoints(ManCodePoint +: cp.drop(1)), item)
        verifyGenderComplementExists(CodePoints(PersonCodePoint +: cp.drop(1)), item)
        None
      case cp if cp.take(2) == Seq(PersonCodePoint, ZwjCodePoint) =>
        verifyGenderComplementExists(CodePoints(ManCodePoint +: cp.drop(1)), item)
        verifyGenderComplementExists(CodePoints(WomanCodePoint +: cp.drop(1)), item)
        Some((ZwjDiversityType.LeadingGender, cp.drop(2)))
      case cp
          if cp.takeRight(4) == Seq(
            VS16CodePoint,
            ZwjCodePoint,
            MaleSignCodePoint,
            VS16CodePoint
          ) =>
        verifyGenderComplementExists(
          CodePoints(cp.dropRight(2) ++ Seq(FemaleSignCodePoint, VS16CodePoint)),
          item
        )
        Some((ZwjDiversityType.TrailingGenderWithVariant, cp.dropRight(4)))
      case cp
          if cp.takeRight(4) == Seq(
            VS16CodePoint,
            ZwjCodePoint,
            FemaleSignCodePoint,
            VS16CodePoint
          ) =>
        verifyGenderComplementExists(
          CodePoints(cp.dropRight(2) ++ Seq(MaleSignCodePoint, VS16CodePoint)),
          item)
        None
      case cp if cp.takeRight(3) == Seq(ZwjCodePoint, MaleSignCodePoint, VS16CodePoint) =>
        verifyGenderComplementExists(
          CodePoints(cp.dropRight(2) ++ Seq(FemaleSignCodePoint, VS16CodePoint)),
          item
        )
        Some((ZwjDiversityType.TrailingGenderWithoutVariant, cp.dropRight(3)))
      case cp if cp.takeRight(3) == Seq(ZwjCodePoint, FemaleSignCodePoint, VS16CodePoint) =>
        verifyGenderComplementExists(
          CodePoints(cp.dropRight(2) ++ Seq(MaleSignCodePoint, VS16CodePoint)),
          item)
        None
      case _ =>
        throw new Exception(
          s"Zwj diversity item ${item.codepoints.key} needs to be in a pair of leading or trailing genders"
        )
    }
  }

  private def codePointSequencesByZwjDiversityType(typeNeeded: ZwjDiversityType.Value) =
    zwjDiversityBreakdown.collect {
      case (zwjDiversityType, cp) if zwjDiversityType == typeNeeded => cp
    }

  val zwjLeadingGenderRegex = regexFromCodepointSequences(
    codePointSequencesByZwjDiversityType(ZwjDiversityType.LeadingGender)
  )
  val formattedZwjLeadingGenderRegex = formatMultilineString(zwjLeadingGenderRegex, quote)

  val zwjTrailingGenderWithVariantRegex = regexFromCodepointSequences(
    codePointSequencesByZwjDiversityType(ZwjDiversityType.TrailingGenderWithVariant)
  )
  val formattedZwjTrailingGenderWithVariantRegex = formatMultilineString(
    zwjTrailingGenderWithVariantRegex,
    quote
  )

  val zwjTrailingGenderWithoutVariantRegex = regexFromCodepointSequences(
    codePointSequencesByZwjDiversityType(ZwjDiversityType.TrailingGenderWithoutVariant)
  )
  val formattedZwjTrailingGenderWithoutVariantRegex = formatMultilineString(
    zwjTrailingGenderWithoutVariantRegex,
    quote
  )

  val zwjRegex = regexFromCodepointSequences(
    zwjNonDiversityItems.map(_.codepoints.cp)
  )
  val formattedZwjRegex = formatMultilineString(zwjRegex, quote)

  def codePointSequencesByType(emojiType: EmojiType.Value) =
    nonZwjItems
      .filter {
        _.emojiType == emojiType
      }
      .map { _.codepoints.cp }

  val keycapPrefixRegex = regexFromCodepointSequences(
    codePointSequencesByType(EmojiType.Keycap).map {
      // KeycapCodePoint gets added back in the RegEx after the optional variant
      _.filter { _ != KeycapCodePoint }
    }
  )
  val formattedKeycapPrefixRegex = formatMultilineString(keycapPrefixRegex, quote)

  val variantRegex = regexFromCodepointSequences(codePointSequencesByType(EmojiType.Variant))
  val formattedVariantRegex = formatMultilineString(variantRegex, quote)

  val textDefaultRegex = regexFromCodepointSequences(
    codePointSequencesByType(EmojiType.TextDefault))
  val formattedTextDefaultRegex = formatMultilineString(textDefaultRegex, quote)

  val diversityRegex = regexFromCodepointSequences(
    codePointSequencesByType(EmojiType.Diversity)
  )
  val formattedDiversityRegex = formatMultilineString(diversityRegex, quote, indent = "      ")

  val variantDiversityRegex = regexFromCodepointSequences(
    codePointSequencesByType(EmojiType.VariantDiversity)
  )
  val formattedVariantDiversityRegex =
    formatMultilineString(variantDiversityRegex, quote, indent = "      ")

  val normalRegex = regexFromCodepointSequences(
    codePointSequencesByType(EmojiType.Flag) ++
      codePointSequencesByType(EmojiType.Regional) ++
      codePointSequencesByType(EmojiType.Normal)
  )
  val formattedNormalRegex = formatMultilineString(normalRegex, quote)

  val multiDiversityRegex = regexFromCodepointSequences(multiDiversityCodepointSequences)
  val formattedMultiDiversityRegex = formatMultilineString(multiDiversityRegex, quote)

  val categories = config.categories.map(new CategoryForInfo(_, withVariantSuffix, quote))

  val longestCodepointSequence = emojiItems.map(_.maxCodePointSequenceLength).max

  val spriteSheetRows = rows
  val spriteSheetColumns = columns
}
