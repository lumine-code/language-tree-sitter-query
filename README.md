# language-tree-sitter-query

Tree-sitter query language support.

## Features

- **Grammars**: provides Tree-sitter grammars for `.scm` query files.
- **Syntax highlighting**: distinguishes captures, predicates, fields, node names, strings, comments, anchors and quantifiers.
- **Folding and indentation**: follows parenthesized patterns and bracketed alternatives.
- **Symbols**: exposes capture names to Tree-sitter symbol providers.

## Installation

To install `language-tree-sitter-query` search for it in the Install pane of the Lumine settings, or run the command `lumine --install lumine-code/language-tree-sitter-query`.

## Usage

Open a `.scm` query file such as `highlights.scm`, `folds.scm` or `tags.scm`. The editor selects the Tree-sitter Query grammar automatically. This grammar describes Tree-sitter's query language; Scheme source requires a Scheme grammar.

## Services

- `hyperlink.injection`: consumed to highlight clickable URLs inside comments.
- `todo.injection`: consumed to highlight TODO-style markers inside comments.

## Source and licenses

The grammar queries originate in [pulsar-tree-sitter-tools](https://github.com/savetheclocktower/pulsar-tree-sitter-tools) and are adapted for Lumine under the MIT license. The parser is built from an immutable revision of [tree-sitter-query](https://github.com/tree-sitter-grammars/tree-sitter-query) under Apache-2.0. See [NOTICE](NOTICE), [LICENSE](LICENSE) and [LICENSE-APACHE](LICENSE-APACHE).

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
