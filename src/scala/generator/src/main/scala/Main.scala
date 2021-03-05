import com.github.mustachejava.{DefaultMustacheFactory}
import java.io.{File, FileOutputStream, OutputStreamWriter}
import java.nio.file.FileSystems

object Main {
  def main(args: Array[String]): Unit = {
    val optionsMap = parseOptions(Seq(args).flatten)
    optionsMap
      .get("twemojiJsRegexFile")
      .flatMap(resolveFile)
      .foreach(generateTwemojiJsRegex)
  }

  private val options = Seq("twemojiJsRegexFile")
  private val optionsRegex = options.mkString("-{0,2}(", "|", ")").r
  private val standaloneOptions = Seq("help")
  private val standaloneOptionsRegex =
    standaloneOptions.mkString("-{0,2}(", "|", ")").r

  private def parseOptions(
      params: Seq[String],
      partialMap: Map[String, String] = Map()
  ): Map[String, String] = {
    params match {
      case Nil => partialMap
      case optionsRegex(validOption) :: value :: tail =>
        parseOptions(
          tail,
          partialMap + (validOption -> value)
        )
      case standaloneOptionsRegex(validOption) :: tail =>
        parseOptions(
          tail,
          partialMap + (validOption -> "")
        )
      case badOption :: tail => {
        println("warning: unexpected option: " + badOption)
        parseOptions(tail, partialMap)
      }
    }
  }

  val fileSystem = FileSystems.getDefault

  val mustacheFactory = new DefaultMustacheFactory("codegen/")

  private def resolveFile(fileName: String): Option[File] = {
    Option(fileName)
      .map {
        fileSystem.getPath(_)
      }
      .filter { path =>
        !Option(path.getParent).exists { !_.toFile.exists }
      }
      .map { path =>
        path.toFile
      }
      .filter { file =>
        !file.isDirectory
      }
  }

  def generateTwemojiJsRegex(file: File): Unit = {
    val view = new EmojiInfoGeneratedView("/config/emoji.yml",
                                          quote = "'",
                                          isUCS2 = true)
    val stream = new FileOutputStream(file)
    val writer = new OutputStreamWriter(stream, "UTF-8")
    val mustache = mustacheFactory.compile("regex.js.mustache")

    try {
      mustache.execute(writer, view)
    } finally {
      writer.close()
      stream.close()
    }
  }
}
