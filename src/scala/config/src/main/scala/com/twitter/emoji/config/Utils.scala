package com.twitter.emoji.config

object Utils {
  def escapeBackslashesAndTabs(s: String): String =
    s.replaceAll("\\\\", "\\\\\\\\")
      .replaceAll("\\\t", "\\\\t")

  def escapeForScala(s: String): String =
    escapeBackslashesAndTabs(s)
      .replaceAll("\"", "\\\\\"")

  def escapeForJs(s: String): String =
    escapeBackslashesAndTabs(s)
      .replaceAll("'", "\\\\'")

  // Add linefeeds at safe places in a long string literal, escaping quotes if needed.
  def formatMultilineString(text: String,
                            quote: String,
                            indent: String = "    "): String = {
    val textWithEscapedQuotes = text.replaceAll(quote, "\\\\" + quote)
    val matches = ".{1,85}[^\\\\]{0,5}".r.findAllIn(textWithEscapedQuotes)
    matches.mkString(quote, quote + " +\n" + indent + quote, quote)
  }
}
