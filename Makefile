default: ns lib

xdefault: rules_ocaml sidebars tools_ocaml providers

import:
	bazel build //stardoc:ocaml_import --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ocaml_import.adoc docs/rules-ocaml/reference

lib:
	bazel build //stardoc:ocaml_library --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ocaml_library.adoc docs/rules-ocaml/reference

module:
	bazel build //stardoc:ocaml_module --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ocaml_module.adoc docs/rules-ocaml/reference

ns:
	bazel build //stardoc:ocaml_ns //stardoc:ocaml_ns_config //stardoc:ocaml_ns_module --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ocaml_ns*.adoc docs/rules-ocaml/reference

rt:
	bazel build //stardoc:ocaml_runtime --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ocaml_runtime.adoc docs/rules-ocaml/reference

test:
	bazel build //stardoc:ocaml_test --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ocaml_test.adoc docs/rules-ocaml/reference

providers:
	bazel build \
	//stardoc:ocamlccinfo \
	//stardoc:ocamldepsprovider \
	--show_result=20 \
	 && cp -fv .bazel/bin/stardoc/OCamlCcInfo.adoc docs/rules-ocaml/reference \
	 && cp -fv .bazel/bin/stardoc/OCamlDepsProvider.adoc docs/rules-ocaml/reference


rules_ocaml:
	bazel build //stardoc:rules_ocaml \
	&& sudo cp -v .bazel/bin/stardoc/rules_ocaml.adoc docs/rules-ocaml/reference/ocaml-rules.adoc

sidebars:
	bazel build //stardoc:rules_ocaml_sidebar \
	&& sudo cp -v .bazel/bin/stardoc/sidebar_rules_ocaml.yml docs/_data/sidebars/sidebar_rules_ocaml_refman.yml

tools_ocaml:
	bazel build //stardoc:bindiff
	bazel build //stardoc:cppo
	bazel build //stardoc:menhir
	sudo cp -v .bazel/bin/stardoc/bindiff_test.adoc docs/tools-ocaml/reference/
	sudo cp -v .bazel/bin/stardoc/cppo.adoc docs/tools-ocaml/reference/
	sudo cp -v .bazel/bin/stardoc/menhir.adoc docs/tools-ocaml/reference/

# providers:
# 	bazel build //stardoc:providers_ocaml \
# 	&& sudo cp -v .bazel/bin/stardoc/ocaml-providers.adoc docs/rules-ocaml/reference

functions:
	bazel build //stardoc:functions \
	&& sudo cp -v .bazel/bin/stardoc/functions.adoc docs/rules-ocaml/reference

################
ppx_executable:
	bazel build //stardoc:ppx_executable --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ppx_executable.adoc \
	docs/rules-ppx/reference

ppx_expect_test:
	bazel build //stardoc:ppx_expect_test --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ppx_expect_test.adoc \
	docs/rules-ppx/reference

ppx_inline_test:
	bazel build //stardoc:ppx_inline_test --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ppx_inline_test.adoc \
	docs/rules-ppx/reference

ppx_transform:
	bazel build //stardoc:ppx_transform --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ppx_transform.adoc \
	docs/rules-ppx/reference

################
ctypes:
	bazel build //stardoc:ctypes_module --show_result=20 \
	 && cp -fv .bazel/bin/stardoc/ctypes_module.adoc \
	docs/rules-ctypes/reference/ctypes_module.adoc

