[User Guide](index.md)

# PPX Support

* [Overview](#overview)
* [Building PPX resources](#building)
* [Preprocessing v. build dependencies](#ppx_deps)
* [Adjunct dependencies](#adjunct_deps)
* [Runtime dependencies](#runtime_deps)
* [Ppx executables](#executables)
  * [Main module](#main_module)
    * [Ppxlib driver](#ppxlib_driver)
* [PPX attributes](#ppx_attribs)
* [PPX Testing](#testing)

## <a id="overview" name="overview">Overview</a>

PPX = PreProcessor eXtension.

Demos: [demos/ppx](https://github.com/obazl/dev_obazl/tree/main/demos/ppx)

## <a id="building" name="building">Building PPX resources</a>

See also [PPX Optimizations](optimization.md#ppx).

* [modules](#modules)
* [libraries](#libraries)
* [archives](#archives)
* [executables](#executables)

#### <a name="modules">Building PPX modules</a>

Rule: [ppx_module](../refman/rules_ppx.md#ppx_module)

Building:

```
load("@obazl_rules_ocaml//ocaml:rules.bzl", "ppx_module")
...
ppx_module(
    name      = "ppx_greeting",
    struct    = ":ppx_greeting.ml",
    deps_opam = ["ppxlib"]
)
```

Demo: [demos/ppx/rewriter/greeting](https://github.com/obazl/dev_obazl/tree/main/demos/ppx/rewriter/greeting)

#### <a name="libraries">Building PPX libraries</a>

Rule: [ppx_library](../refman/rules_ppx.md#ppx_library)

#### <a name="archives">Building PPX archives</a>

Rule: [ppx_archive](../refman/rules_ppx.md#ppx_archive)

#### <a name="executables">Building PPX executables</a>

Rule: [ppx_executable](../refman/rules_ppx.md#ppx_executable)

[**WARNING** This documentation assumes you are using
[ppxlib](https://github.com/ocaml-ppx/ppxlib). TODO: how to do it without ppxlib.]

A PPX (ppxlib) executable requires a _driver_, which can easily be
created using a Bazel [genrule](https://docs.bazel.build/versions/master/be/general.html#genrule):

```
load("@obazl_rules_ocaml//ocaml:rules.bzl", "ppx_module")
...
ppx_module(
    name = "Driver",
    struct = ":ppxlib_driver.ml",
    deps_opam = ["ppxlib"]
)
genrule(
    name = "gendriver",
    outs = ["ppxlib_driver.ml"],
    # In the cmd string, '$@' == outs file, here ppxlib_driver.ml
    cmd = "\n".join([
        "echo \"(* GENERATED FILE - DO NOT EDIT *)\" > \"$@\"",
        "echo \"let () = Ppxlib.Driver.standalone ()\" >> \"$@\"",
    ]),
)
```

The PPX executable will depend on any PPX modules it needs, and the
driver must be placed last in the dependency list. OBazl provides an
optional convenience attribute to support this: pass the driver via
the `main` attribute of `ppx_executable`, and OBazl will arrange for
it to come last in the dep list:

```
load("@obazl_rules_ocaml//ocaml:rules.bzl", "ppx_executable")
...
ppx_executable(
    name = "ppx.exe",
    main = ":Driver",
    deps = [":ppx_greeting"] # ppx_module containing handler for [%greeting ...] extension points
)
```

equivalently:

```
ppx_executable(
    name = "ppx.exe",
    deps = [":ppx_greeting", ":Driver"]
)
```

>    **IMPORTANT** Remember that compilation of an executable can succeed
  even if you omit critical dependencies, since OCaml does not define
  a required 'main' routine. The purpose of the `main` attribute is to
  minimize the probability of putting the `deps` in the wrong order or
  inadvertently omitting a driver.

Demo: [demos/ppx/rewriter/greeting](https://github.com/obazl/dev_obazl/tree/main/demos/ppx/rewriter/greeting)

## <a id="ppx_deps" name="ppx_deps">Preprocessing v. build dependencies</a>

Every OCaml module (archive, executable) has its own _build_
dependency graph, which is a tree containing the modules upon which it
directly and indirectly depends.

OCaml extension points introduce a second dependency graph we call a
_preprocessing_ dependency graph. A source file that contains an
extension point, such as `[%greeting "Hello"]`, must be preprocessed
by code that is capable of handling the extension point. This
_preprocessing_ dependency is orthogonal to any _build_ dependencies
the source file may have; normally it is a single PPX executable
containing PPX modules that implement handle extension point handlers.

Thus any module that contains OCaml extension points has two distinct
dependency graphs, one for build dependencies and one for
preprocessing dependencies. In OBazl rules, ordinary build
dependencies are usually expressed using a `deps` attribute, and
preprocessing dependencies are expressed using the `ppx` attribute and
a few additional `ppx_*` attributes to parameterize the PPX executable.

## <a id="adjunct_deps" name="adjunct_deps">Adjunct (a/k/a "runtime") dependencies</a>

Sometimes PPX processing injects code that induces compile-time
dependencies; such dependencies must be listed as `deps` in the
`ocaml_module` or `ppx_module` rule that compiles the transformed
source file. These are often erroneously called "runtime"
dependencies, but [runtime dependency](#runtime-deps) is a different
concept. Runtime dependencies of a module or executable are needed
when that module or executable is executed. These dependencies do not
fit that description, so OBazl calls them _adjunct dependencies_.

In other words, adjunct dependencies are build dependencies that are
attached to a preprocessing dependency graph and passed on to
preprocessing outputs.

One way to support adjunct dependencies is to list them in the `deps`
attribute of the `ocaml_module` or `ppx_module` rule instances that
use the PPX executable, as noted above. However this requires
maintenance of the `deps` attribute for each rule instance using the
PPX executable in question. Since PPX executables may be shared by
many targets, this is cumbersome and error-prone.

attribute: **`adjunct_deps`**

As a convenience, OBazl supports an attribute, `adjunct_deps`, on
`ppx_module` and `ppx_executable` rules. Dependencies listed in this
attribute will be automatically propagated through the preprocessing
dependency graph to the build rule of the transformed source. For
example, if an `ocaml_module` rule instance lists a `ppx` dependency,
then any adjunct dependencies listed in the dependency graph of that
ppx will be added as build dependencies of the module being compiled
by the rule.

See
[demos/ppx/adjunct_deps](https://github.com/obazl/dev_obazl/tree/main/demos/ppx/adjunct_deps)
for an example.

## <a name="runtime-deps">Runtime dependencies</a>

Runtime dependencies are files that are required by modules and/or
executables at runtime. For example, a common pattern is to have a
module read a file of configuration data at runtime; such a data file
constitutes a runtime dependency of the module.

For non-PPX modules and executables, such
files must be passed using the `data` attribute; for PPX modules and
executables, they must be passed using the `ppx_data` attribute, as
[described below](#ppx_data).
The rules will arrange for the files to be included in the generated
command line with the appropriate option flags.

## <a name="executables">PPX executables</a>

### <a name="main_module">Main Module</a>

Unlike many compiled languages, OCaml does not define a `main` entry
point for executables. The modules used to construct an executable are
organized in the executable binary in the order in which they were
passed as arguments to the compiler. When control is passed to an
OCaml executable, the (top-level) code of the component modules is
executed in order.

This means it is possible to successfully compile and run an OCaml
executable that lacks critical modules. Since there is no `main` entry
point, the compiler has no way of knowing that something is missing.

The `main` attribute of the `ppx_executable` rule is an optional convenience
attribute, intended to reduce the likelihood of inadvertently omitting
the critical piece of code that drives PPX processing. A module passed
as `main` will automatically be added as the last module in the
dependency list, thereby ensuring that it will receive control after
all other modules.

Demo code:  [demos/ppx/hello](https://github.com/obazl/dev_obazl/blob/aed0ce898b480c109ccd9b42fddc6f6c1640277c/demos/ppx/hello/BUILD.bazel#L53)

#### <a name="ppxlib_driver">The Ppxlib Driver module</a>

Here is one way to implement a driver for a `ppx_executable`:

```
ppx_executable( name = "_ppx.exe", main = ":_Driver", ...etc... )
ppx_module(
    name = "_Driver",
    src = ":ppxlib_driver.ml",
    deps = ["@opam//pkg:ppxlib"],
)
genrule(
    name = "gendriver",
    outs = ["ppxlib_driver.ml"],
    cmd = "\n".join([
        "echo \"(* GENERATED FILE - DO NOT EDIT *)\" > \"$@\"",
        "echo \"let () = Ppxlib.Driver.standalone ()\" >> \"$@\"",
    ]),
)
```

----
## <a name="ppx_attribs">PPX attributes</a>

These attributes apply to rules [ocaml_module](../refman/rules_ocaml.md#ocaml_module), [ocaml_interface](../refman/ocaml_rules.md#ocaml_interface), [ppx_module](../refman/rules_ppx.md#ppx_module).

Attributes applicable to `ppx_*` rules are documented in the [Reference Manual](../refman/rules_ppx.md)

### <a name="ppx">ppx</a>

The `ppx` attribute takes a `ppx_executable` target. The rule will
generate several actions - see [Action Queries](transparency.md#action_queries)
to see how to inspect the actions.

### <a name="adjunct_deps_attrib">adjunct_deps</a>

See above.

### <a name="ppx_args">ppx_args</a>

Use `ppx_args` to pass options to the `ppx_executable` that is passed via the `ppx` attribute.

### <a name="ppx_data">ppx_data</a>

Bazel uses a `data` attribute for runtime file dependencies; OBazl
follows this convention. For rules `ocaml_executable`, `ocaml_module`,
`ocaml_interface`, `ppx_executable`, and `ppx_module`, the `data`
attribute is for files that will be needed at runtime.

The `ppx_data` attribute is for files that are needed by the `ppx`
executable when it transforms source files. For example,
[ppx_optcomp]() supports an extension, `import`, that acts like
the `#include` directive of the C preprocessor language: it allows you
to include the content of one file in another. This induces a runtime
dependency: if `foo.ml` contains e.g. `[%import "config.mlh"]`, then
the file `config.mlh` must be available to `ppx_optcomp` when it runs
(as part of the `ppx_executable` tasked with transforming `foo.ml`).
So this is a genuine runtime dependency, and it must be listed in the
`ppx_data` attribute of the `ppx_executable` rule instance that lists
`ppx_optcomp` as a dependency.

See [ppx/ppx_optcomp](https://github.com/obazl/dev_obazl/blob/c0f01d6ae66ecdebbbfac687120ef734886542d4/demos/ppx/ppx_optcomp/BUILD.bazel#L27) for an example.

### <a name="ppx_print">ppx_print</a>

PPX executables can emit the AST they produce in binary or text form.

Rules that support PPX processing
([ocaml_interface](../refman/rules_ocaml.md#ocaml_interface),
[ocaml_module](../refman/rules_ocaml.md#ocaml_module),
[ppx_module](../refman/rules_ppx.md#ppx_module)) also support the
`ppx_print` attribute, which controls output format.

The `ppx_print` attribute takes a label, which must be either
`@ppx//print:binary` or `@ppx//print:text`. The former tells OBazl to
add `-dump-ast` as a command line option when running the
`ppx_executable` that is passed by the `ppx` attribute; the latter
just omits the argument.

The default print output format is determined by the
[config rules](configrules.md) target
`@ppx//print`, which in turn defaults to binary. You can change the
global default to print by passing `--@ppx//print:text` on the command
line. Use the `ppx_print` attribute to override this global default.

## <a name="testing">PPX Testing</a>

Rules

* [ocaml_test](../refman/rules_ocaml.md#ocaml_test)
* [ppx_test](../refman/rules_ppx.md#ppx_test)
