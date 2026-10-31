; A recovered quote is literal content even inside an unfinished pattern.
(ERROR "\"" @match.next
  (#set! indent.match startPosition))

; Delimiters balance on the row where they occur. A completed child or
; predicate does not dedent the following capture or sibling pattern.
["[" "("] @indent
["]" ")"] @dedent

; A standalone closer finishes its construct even if the user kept extra
; leading spaces. Inline child patterns and predicates keep their parent level.
((")" @match.next)
  (#is? test.firstTextOnRow)
  (#set! indent.match parent.startPosition))
