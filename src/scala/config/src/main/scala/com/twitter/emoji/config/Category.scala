package com.twitter.emoji.config

import com.twitter.emoji.config.Utils.{escapeForJs, formatMultilineString}

case class Category(
    id: String,
    title: String,
    items: Seq[Item]
) {
  val escapedTitleForJs = escapeForJs(title)

}

class CategoryForInfo(c: Category,
                      withVariantSuffix: Boolean,
                      quote: String = "\"")
    extends Category(c.id, c.title, c.items) {
  val formattedItems: String = {
    val itemsAsString = items
      .filterNot(_.excludeFromPicker)
      .map { item =>
        if (withVariantSuffix) {
          val variant =
            if (EmojiType.VariantTypes.contains(item.emojiType)) "=" else ""
          val diversity =
            if (EmojiType.SingleDiversityTypes.contains(item.emojiType)) "*"
            else ""
          val textDefault =
            if (item.emojiType == EmojiType.TextDefault) "T" else ""
          item.key + variant + diversity + textDefault
        } else item.key
      }
      .mkString(" ")
    formatMultilineString(itemsAsString, quote, "        ")
  }

  val formattedItemsAsText: String = {
    val itemsAsString = items
      .filterNot(_.excludeFromPicker)
      .map(_.text)
      .mkString(" ")
    formatMultilineString(itemsAsString, quote, "        ")
  }
}
