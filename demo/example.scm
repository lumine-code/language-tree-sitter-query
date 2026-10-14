; Query patterns used by highlighting, folding and symbol queries.

(call_expression function: (identifier) @function)

((identifier) @constant
  (#match? @constant "^[A-Z_]+\\?$"))

((comment) @comment
  (#set! capture.final true))

[(string) (number)] @literal

(arguments . (identifier)+ .)

(identifier)? @optional

(string)* @strings

"\\n" @newline

(_) @wildcard

(expression/binary_expression) @operation

(function_definition !type_parameters)

(MISSING identifier) @missing

(ERROR) @error

; An ordinary comment remains comment text.
