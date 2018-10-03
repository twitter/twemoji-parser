node_module(
    sources = rglobs(
        ".babelrc",
        ".eslintignore",
        ".eslintrc",
        ".flowconfig",
        "scripts/*",
        "src/*",
        "jest.config.js",
        "package.json",
        "yarn.lock",
    ),
    package_manager = "yarn",
)

node_test(
    name = "lint",
    script_name = "lint",
    dependencies = [":twemoji-parser"],
)

node_test(
    name = "flow",
    script_name = "flow:ci",
    dependencies = [":twemoji-parser"],
)

node_test(
    name = "jest",
    script_name = "test:ci",
    dependencies = [":twemoji-parser"],
)
