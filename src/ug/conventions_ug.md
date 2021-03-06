[User Guide](index.md)

# OBazl Conventions

* `.bazelrc` - always put this file in the project root directory; at
  a minimum, it should contain

    ```try-import user.bazelrc```.

    See [.bazelrc, the Bazel configuration file](https://docs.bazel.build/versions/master/guide.html#bazelrc-the-bazel-configuration-file) for more information.

* Use `user.bazelrc` to pass arguments to Bazel. Do not put
  `user.bazelrc` under version control. Add it to `.gitignore`.

  * Use `:name` suffixes to control configurations at the command line
    using `--config` (documented under `--config` at the bottom of:
    [.bazelrc, the Bazel configuration file](https://docs.bazel.build/versions/master/guide.html#bazelrc-the-bazel-configuration-file)).

    For example, use `:quiet` to mark arguments you want to disable by passing `--config=quiet`:

```
    build --color=yes
    build --subcommands=pretty_print
    build:quiet --subcommands=false
    build --verbose_failures
    build --sandbox_debug
```

* Put the following in `.gitignore`:

  * `dev/` - developers can use this subdirectory for shell scripts,
    data files, etc. that should not be under version control
  * `logs/`
  * `tmp/`
  * `user.bazelrc`

* Use `.bazelignore` to exclude irrelevant subdirectories from Bazel
  processing. For example, if you are adding Bazel support to a
  project that uses Dune, put `_build` in `.bazelignore`.

* `WORKSPACE.bazel`, not `WORKSPACE`

    Explicitly name your workspace - make
    `workspace(name="foo")` the first line of `WORKSPACE.bazel`
    (replacing `foo` with your workspace name). This will make log
    messages more decipherable, among other things.

* Use `WORKSPACE.bzl` for extension code needed by `WORKSPACE.bazel`,
  such as `fetch()` functions that [fetch](bootstrap.md#fetch_rules)
  language rules and external repositories.

* `BUILD.bazel`, not `BUILD`

* Use `BUILD.bzl` for extension code needed by `BUILD.bazel`

* Importing external repositories

  * If you import only a small number of repositories, and you do not
    expect others to import your repository, put the importing rules
    (`http_repository`, `git_repository`) in `WORKSPACE.bazel`

  * Otherwise, define one or more bootstrapping functions in
    `WORKSPACE.bzl` (note the extension, `.bzl`, not `.bazel`)
    responsible for fetching the repositories. See
    [Bootstrapping](bootstrap.md) for an example. Name them
    `<lang>_fetch_rules` (for fetching language support packages) and
    `<lang>_fetch_repos` for library repositories.

* Mixed projects - using Bazel and another build tool (e.g. Dune) in
  parallel

  * If you want to keep Bazel files segregated, create a top-level
    `bzl` directory and keep Bazel extension files etc. there.

* Use a `tools` subdirectory to store shell scripts and any other tools you want under version control.

  * Create a shell **<a name="aliases">alias</a>** to enable easy access
    to the command log. Put the following (or something similar) in
    `tools/aliases`, and then source the file: `$ source
    tools/aliases`. Then `$ bl` will browse the log using `less`.

```
    alias "bl=less `bazel info command_log`"
```

## <a name="naming_conventions">Naming Conventions</a>

* Repository fetching functions:

  * `<lang>_fetch_rules` - for fetching rules packages
  * `<lang>_fetch_repo`, `<lang>_fetch_repos` - for fetching library
  * repositories alternative: `<lang>_fetch_lib`, `<lang>_fetch_libs`

* primary target names should match package name. E.g. `//foo/bar:bar`

* `ocaml_module` and `ppx_module` targets that are package-internal
  should capitalize the initial character (i.e. should match the OCaml
  module name), with a prefixed underscore. For example,
  `ocaml_module(name="_Foo", src="foo.ml"...)`. Public module targets
  (those used by other packages) should use the same convention
  without the underscore prefix, except for the primary target, whose
  case should match the package name.

* `ocaml_interface` targets should follow the same convention as for
  modules, suffixed by `.cmi`. For example:
  `ocaml_interface(name="_Foo.cmi", src="foo.mli"...)`

* `ocaml_ns` and `ppx_ns` target names should be suffixed by `_ns`.

