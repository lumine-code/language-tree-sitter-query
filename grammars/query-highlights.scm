; Adapted from Andrew Dupont's MIT-licensed Tree-sitter query grammar for Pulsar.
; Updated for tree-sitter-query 0.8 and extended by lumine-code.

(comment) @comment.line.semicolon.scm

((comment) @punctuation.definition.comment.scm
  (#set! adjust.endAfterFirstMatchOf "^;"))

(string) @string.quoted.double.scm
(string "\"" @punctuation.definition.string.scm)
(escape_sequence) @constant.character.escape.scm

(capture) @variable.other.capture.scm
(capture "@" @punctuation.definition.variable.scm)

(named_node name: (identifier) @constant.language.capture.scm)
(named_node supertype: (identifier) @constant.language.capture.scm)
(named_node "_" @constant.language.capture.wildcard.scm)
(anonymous_node "_" @constant.language.capture.wildcard.scm)

(missing_node "MISSING" @keyword.other.missing.scm)
(missing_node name: (identifier) @constant.language.capture.scm)

(field_definition
  (identifier) @storage.modifier.field.scm @entity.other.attribute-name.scm
  ":" @storage.modifier.field.scm @entity.other.attribute-name.scm)
(negated_field (identifier) @storage.modifier.field.scm @entity.other.attribute-name.scm)
(negated_field "!" @keyword.operator.negation.scm)

(predicate
  ["#" "." (identifier) (predicate_type)] @keyword.other.special-method.scm)

(quantifier) @keyword.operator.quantifier.scm
"." @keyword.operator.anchor.scm
"/" @punctuation.separator.supertype.scm
":" @punctuation.separator.key-value.scm
"(" @punctuation.section.parens.begin.scm
")" @punctuation.section.parens.end.scm
"[" @punctuation.section.brackets.begin.scm
"]" @punctuation.section.brackets.end.scm

(ERROR) @invalid.illegal.scm
