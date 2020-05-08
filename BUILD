node_module(
    sources = [
        ".babelrc",
        ".eslintignore",
        ".eslintrc",
        ".flowconfig",
        "jest.config.js",
        "package.json",
        "scripts/**/*",
        "src/**/*",
        "yarn.lock",
    ],
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
