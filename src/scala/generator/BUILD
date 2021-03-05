target(
    dependencies = [
        "generator/src/main/scala",
    ],
)

jvm_binary(
    name = "bin",
    basename = "emoji-generator",
    main = "Main",
    dependencies = [":generator"],
)
