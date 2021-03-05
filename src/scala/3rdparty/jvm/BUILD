jar_library(
    name='junit',
    jars=[
        jar('junit', 'junit', '4.12'),
    ],
    # junit is frequently used only for its annotations.
    scope='forced',
)

jar_library(
    name='scalatest',
    jars=[
        scala_jar('org.scalatest', 'scalatest', '3.0.0'),
    ],
)

jar_library(
    name = "mockito-core",
    jars = [
        jar(
            org = "org.mockito",
            name = "mockito-core",
            intransitive = False,
            rev = "3.3.3",
        ),
    ],
)

jar_library(
    name = "scalatestplus",
    jars = [
        scala_jar(
            org = "org.scalatestplus",
            name = "junit-4-12",
            intransitive = False,
            rev = "3.1.2.0",
        ),
    ],
)

jar_library(
    name = "snakeyaml",
    jars = [
        jar(
            org = "org.yaml",
            name = "snakeyaml",
            intransitive = False,
            rev = "1.24",
        ),
    ],
)

jar_library(
    name = "mustache",
    jars = [
        jar(
            org = "com.github.spullara.mustache.java",
            name = "compiler",
            intransitive = False,
            rev = "0.8.18",
        ),
        jar(
            org = "com.github.spullara.mustache.java",
            name = "scala-extensions-2.10",
            intransitive = False,
            rev = "0.8.18",
        ),
    ],
)