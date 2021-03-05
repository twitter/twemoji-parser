package com.twitter.emoji.config

import org.junit.runner.RunWith
import org.scalatest.wordspec.AnyWordSpec
import org.scalatest.matchers.must.Matchers
import org.scalatestplus.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class CategorySpec extends AnyWordSpec with Matchers {
  val defaultCategory = Category(
    "foo",
    "Foo",
    Seq(
      Item(CodePoints(Seq(0x1f604)), "normal", EmojiType.Normal),
      Item(CodePoints(Seq(0x2b50)), "White medium star", EmojiType.Variant),
      Item(CodePoints(Seq(0x1f476)), "Baby", EmojiType.Diversity, false),
      Item(CodePoints(Seq(0x261d)), "text", EmojiType.TextDefault)
    )
  )
  "CategorySpec" which {
    "CategoryForInfo" which {
      "formats correctly when withVariantSuffix is true" in {
        val categoryForInfo =
          new CategoryForInfo(c = defaultCategory, withVariantSuffix = true)
        categoryForInfo.formattedItems.trim() must equal(
          "\"1f604 2b50= 1f476* 261dT\"")
      }

      "formats correctly when withVariantSuffix is false" in {
        val categoryForInfo =
          new CategoryForInfo(c = defaultCategory, withVariantSuffix = false)
        categoryForInfo.formattedItems.trim() must equal(
          "\"1f604 2b50 1f476 261d\"")
      }
    }
  }
}
