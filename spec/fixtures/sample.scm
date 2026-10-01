; Query patterns used by highlighting, folding and symbol queries.

(call_expression function: (identifier) @function)
; <- punctuation.section.parens.begin.scm
; ^ constant.language.capture.scm
;                ^ entity.other.attribute-name.scm
;                          ^ punctuation.section.parens.begin.scm
;                           ^ constant.language.capture.scm
;                                       ^ punctuation.definition.variable.scm
;                                        ^ variable.other.capture.scm
;                                                ^ punctuation.section.parens.end.scm

((identifier) @constant
;^ punctuation.section.parens.begin.scm
  (#match? @constant "^[A-Z_]+\\?$"))
;  ^ keyword.other.special-method.scm
;          ^ punctuation.definition.variable.scm
;                    ^ string.quoted.double.scm
;                             ^ constant.character.escape.scm

((comment) @comment
  (#set! capture.final true))
;  ^ keyword.other.special-method.scm

[(string) (number)] @literal
; <- punctuation.section.brackets.begin.scm
;                 ^ punctuation.section.brackets.end.scm
;                    ^ variable.other.capture.scm

(arguments . (identifier)+ .)
;          ^ keyword.operator.anchor.scm
;                        ^ keyword.operator.quantifier.scm
;                          ^ keyword.operator.anchor.scm

(identifier)? @optional
;           ^ keyword.operator.quantifier.scm

(string)* @strings
;       ^ keyword.operator.quantifier.scm

"\\n" @newline
; <- string.quoted.double.scm
; ^ constant.character.escape.scm

(_) @wildcard
;^ constant.language.capture.wildcard.scm

(expression/binary_expression) @operation
;           ^ constant.language.capture.scm

(function_definition !type_parameters)
;                    ^ keyword.operator.negation.scm

(MISSING identifier) @missing
; ^ keyword.other.missing.scm

(ERROR) @error

; An ordinary comment remains comment text.
