; Capture the delimiters so trailing captures and quantifiers stay outside folds.
[
  (grouping "(" @fold.start ")" @fold.end)
  (named_node "(" @fold.start ")" @fold.end)
  (missing_node "(" @fold.start ")" @fold.end)
  (predicate "(" @fold.start ")" @fold.end)
  (list "[" @fold.start "]" @fold.end)
]
