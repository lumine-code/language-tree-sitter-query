const path = require("path");

const PACKAGE_NAME = "language-tree-sitter-query";
const PACKAGE_PATH = path.resolve(__dirname, "..");
const FIXTURE_PATH = path.join(__dirname, "fixtures", "sample.scm");

describe("Tree-sitter Query grammar", () => {
  let editor;
  let languageMode;

  beforeEach(async () => {
    jasmine.useRealClock();
    await lumine.packages.activatePackage(PACKAGE_PATH);
  });

  afterEach(() => editor?.destroy());

  async function openQuery(text, filePath = "highlights.scm") {
    editor = await lumine.workspace.open(filePath);
    if (text != null) editor.setText(text);
    languageMode = editor.getBuffer().getLanguageMode();
    await languageMode.ready;
    return editor;
  }

  async function setText(text) {
    editor.setText(text);
    await languageMode.atTransactionEnd();
  }

  function scopesAt(row, text, occurrence = 0) {
    const line = editor.lineTextForBufferRow(row);
    let column = -1;
    for (let index = 0; index <= occurrence; index++) {
      column = line.indexOf(text, column + 1);
    }
    expect(column)
      .withContext(`Cannot find ${text} on row ${row + 1}`)
      .not.toBe(-1);
    return editor.scopeDescriptorForBufferPosition([row, column]).getScopesArray();
  }

  async function insertNewline() {
    editor.getLastSelection().insertText("\n", {
      autoIndent: true,
      autoIndentNewline: true,
    });
    await languageMode.atTransactionEnd();
  }

  it("selects and parses the grammar for an scm file", async () => {
    await openQuery(null, FIXTURE_PATH);

    expect(editor.getGrammar().name).toBe("Tree-sitter Query");
    expect(editor.getGrammar().scopeName).toBe("source.scm");
    expect(editor.getGrammar().packageName).toBe(PACKAGE_NAME);
    expect(languageMode.tree.rootNode.hasError).toBe(false);
  });

  it("checks real highlighting assertions in the fixture", async () => {
    await runGrammarTests(FIXTURE_PATH, /;/);
    editor = lumine.workspace.getActiveTextEditor();
    const assertions = normalizeTreeSitterTextData(editor, /;/);
    expect(assertions.length).toBeGreaterThan(25);
  });

  it("distinguishes nodes, fields and capture markers", async () => {
    await openQuery("(call_expression function: (identifier) @function)");

    expect(scopesAt(0, "call_expression")).toContain("constant.language.capture.scm");
    expect(scopesAt(0, "function:")).toContain("entity.other.attribute-name.scm");
    expect(scopesAt(0, ":")).toContain("storage.modifier.field.scm");
    expect(scopesAt(0, "identifier")).toContain("constant.language.capture.scm");
    expect(scopesAt(0, "@")).toContain("punctuation.definition.variable.scm");
    expect(scopesAt(0, "function", 1)).toContain("variable.other.capture.scm");
    expect(scopesAt(0, "function", 1)).not.toContain("entity.other.attribute-name.scm");
  });

  it("spans predicate markers while preserving parameters and escapes", async () => {
    await openQuery(
      '((identifier) @name\n  (#match? @name "^[A-Z]+\\?$"))\n' +
        "((comment) @comment\n  (#set! capture.final true))",
    );

    for (const token of ["#", "match", "?"]) {
      expect(scopesAt(1, token)).toContain("keyword.other.special-method.scm");
    }
    for (const token of ["#", "set", "!"]) {
      expect(scopesAt(3, token)).toContain("keyword.other.special-method.scm");
    }
    expect(scopesAt(1, "name")).toContain("variable.other.capture.scm");
    expect(scopesAt(1, "name")).not.toContain("keyword.other.special-method.scm");
    expect(scopesAt(1, "^[A-Z]")).toContain("string.quoted.double.scm");
    expect(scopesAt(1, "\\?")).toContain("constant.character.escape.scm");
    expect(scopesAt(3, "capture.final")).not.toContain("keyword.other.special-method.scm");
  });

  it("keeps comments out of field and predicate scopes", async () => {
    await openQuery(
      '(; predicate explanation\n #match? @name "x")\n' +
        "(node field ; field explanation\n : (identifier))",
    );

    expect(languageMode.tree.rootNode.hasError).toBe(false);
    for (const token of ["#", "match", "?"]) {
      expect(scopesAt(1, token)).toContain("keyword.other.special-method.scm");
    }
    expect(scopesAt(2, "field", 0)).toContain("entity.other.attribute-name.scm");
    expect(scopesAt(3, ":")).toContain("storage.modifier.field.scm");
    expect(scopesAt(3, ":")).toContain("entity.other.attribute-name.scm");

    for (const row of [0, 2]) {
      const scopes = scopesAt(row, "explanation");
      expect(scopes).toContain("comment.line.semicolon.scm");
      expect(scopes).not.toContain("keyword.other.special-method.scm");
      expect(scopes).not.toContain("storage.modifier.field.scm");
      expect(scopes).not.toContain("entity.other.attribute-name.scm");
    }
  });

  it("highlights anonymous node strings and escaped delimiters", async () => {
    await openQuery([String.raw`"\"" @quote`, '"" @empty', String.raw`"\n" @newline`].join("\n"));

    expect(languageMode.tree.rootNode.hasError).toBe(false);
    expect(scopesAt(0, '\\"')).toContain("constant.character.escape.scm");
    expect(scopesAt(0, '"')).toContain("string.quoted.double.scm");
    expect(scopesAt(1, '"', 0)).toContain("string.quoted.double.scm");
    expect(scopesAt(1, '"', 1)).toContain("string.quoted.double.scm");
    expect(scopesAt(2, "\\n")).toContain("constant.character.escape.scm");
  });

  it("highlights alternations, anchors and each quantifier", async () => {
    await openQuery(
      "[(identifier) (string)] @value\n" +
        "(arguments . (identifier)+ .)\n(identifier)?\n(string)*",
    );

    expect(languageMode.tree.rootNode.hasError).toBe(false);
    expect(scopesAt(0, "[")).toContain("punctuation.section.brackets.begin.scm");
    expect(scopesAt(0, "]")).toContain("punctuation.section.brackets.end.scm");
    expect(scopesAt(0, "(")).toContain("punctuation.section.parens.begin.scm");
    expect(scopesAt(0, ")")).toContain("punctuation.section.parens.end.scm");
    expect(scopesAt(1, ".", 0)).toContain("keyword.operator.anchor.scm");
    expect(scopesAt(1, ".", 1)).toContain("keyword.operator.anchor.scm");
    expect(scopesAt(1, "+")).toContain("keyword.operator.quantifier.scm");
    expect(scopesAt(2, "?")).toContain("keyword.operator.quantifier.scm");
    expect(scopesAt(3, "*")).toContain("keyword.operator.quantifier.scm");
  });

  it("parses supertypes, negated fields, wildcards and missing nodes", async () => {
    await openQuery(
      "(expression/binary_expression) @operation\n" +
        "(function_definition !type_parameters)\n(_) @wildcard\n" +
        '(MISSING identifier) @missing\n(MISSING ";") @delimiter',
    );

    expect(languageMode.tree.rootNode.hasError).toBe(false);
    expect(scopesAt(0, "binary_expression")).toContain("constant.language.capture.scm");
    expect(scopesAt(1, "!")).toContain("keyword.operator.negation.scm");
    expect(scopesAt(2, "_")).toContain("constant.language.capture.wildcard.scm");
    expect(scopesAt(3, "MISSING")).toContain("keyword.other.missing.scm");
    expect(scopesAt(4, "MISSING")).toContain("keyword.other.missing.scm");
    expect(scopesAt(4, '";"')).toContain("string.quoted.double.scm");
  });

  it("keeps semicolons inside strings out of comment scopes", async () => {
    await openQuery('";" @semicolon ; a trailing comment');

    expect(scopesAt(0, ";", 0)).toContain("string.quoted.double.scm");
    expect(scopesAt(0, ";", 0)).not.toContain("comment.line.semicolon.scm");
    expect(scopesAt(0, ";", 1)).toContain("punctuation.definition.comment.scm");
    expect(scopesAt(0, "trailing")).toContain("comment.line.semicolon.scm");
    expect(scopesAt(0, "trailing")).not.toContain("punctuation.definition.comment.scm");
  });

  it("marks malformed query syntax and recovers after an edit", async () => {
    await openQuery("(identifier) @value $");

    expect(languageMode.tree.rootNode.hasError).toBe(true);
    expect(scopesAt(0, "$")).toContain("invalid.illegal.scm");

    await setText("(identifier) @value");
    expect(languageMode.tree.rootNode.hasError).toBe(false);
    expect(scopesAt(0, "value")).toContain("variable.other.capture.scm");
  });

  it("folds a grouped pattern while leaving its closing delimiter and capture visible", async () => {
    await openQuery('((identifier) @name\n  (#match? @name "^[A-Z]+$")) @constant');
    editor.displayLayer.reset({ foldCharacter: "…" });

    expect(editor.isFoldableAtBufferRow(0)).toBe(true);
    editor.foldBufferRow(0);
    expect(editor.displayLayer.getText()).toBe("((identifier) @name…) @constant");
    editor.unfoldAll();
    expect(editor.lineTextForBufferRow(1)).toBe('  (#match? @name "^[A-Z]+$")) @constant');
  });

  it("folds multiline named nodes and alternations", async () => {
    await openQuery("(call_expression\n  function: (identifier) @function) @call");
    editor.displayLayer.reset({ foldCharacter: "…" });
    editor.foldBufferRow(0);
    expect(editor.displayLayer.getText()).toBe("(call_expression…) @call");

    await setText("[\n  (identifier)\n  (string)\n] @value");
    editor.unfoldAll();
    expect(editor.isFoldableAtBufferRow(0)).toBe(true);
    editor.foldBufferRow(0);
    expect(editor.displayLayer.getText()).toBe("[…\n] @value");
  });

  it("does not fold single-line patterns or comments", async () => {
    await openQuery("(identifier) @name\n; an explanation\n(string) @value");

    expect(editor.isFoldableAtBufferRow(0)).toBe(false);
    expect(editor.isFoldableAtBufferRow(1)).toBe(false);
    expect(editor.isFoldableAtBufferRow(2)).toBe(false);
  });

  it("indents new lines inside parentheses and alternations", async () => {
    await openQuery("");
    editor.setTabLength(2);
    editor.setSoftTabs(true);

    for (const text of ["(call_expression", "["]) {
      await setText(text);
      editor.setCursorBufferPosition([0, Infinity]);
      await insertNewline();
      expect(editor.lineTextForBufferRow(1)).toBe("  ");
    }

    await setText("(call_expression\n  arguments: (arguments");
    editor.setCursorBufferPosition([1, Infinity]);
    await insertNewline();
    expect(editor.lineTextForBufferRow(2)).toBe("    ");
  });

  it("returns to the enclosing indent after closing parentheses", async () => {
    await openQuery("(call_expression\n  function: (identifier) @name\n  )");
    editor.setTabLength(2);
    editor.setSoftTabs(true);
    editor.setCursorBufferPosition([2, Infinity]);
    await insertNewline();

    expect(editor.lineTextForBufferRow(3)).toBe("");
  });

  it("dedents a closing alternation bracket as it is typed", async () => {
    await openQuery("[\n  (identifier)\n  ");
    editor.setTabLength(2);
    editor.setSoftTabs(true);
    editor.setCursorBufferPosition([2, Infinity]);
    editor.getLastSelection().insertText("]", {
      autoIndent: true,
      autoDecreaseIndent: true,
    });
    await languageMode.atTransactionEnd();

    expect(editor.lineTextForBufferRow(2)).toBe("]");
  });

  it("exposes capture names as variable definitions to symbol consumers", async () => {
    await openQuery(
      '(identifier) @name\n((string) @value (#match? @value "x"))\n' +
        '(comment) @comment.line\n"+" @operator',
    );

    const groups = await editor.getGrammarQueryCaptureGroups("tagsQuery");
    const group = groups.find(({ grammar }) => grammar === editor.getGrammar());
    expect(group).toBeDefined();
    expect(
      group.captures.filter(({ name }) => name === "name").map(({ node }) => node.text),
    ).toEqual(["name", "value", "comment.line", "operator"]);
    expect(
      group.captures
        .filter(({ name }) => name === "definition.variable")
        .map(({ node }) => node.text),
    ).toEqual(["@name", "@value", "@comment.line", "@operator"]);

    await setText("(identifier) @renamed");
    const updatedGroups = await editor.getGrammarQueryCaptureGroups("tagsQuery");
    const updatedGroup = updatedGroups.find(({ grammar }) => grammar === editor.getGrammar());
    expect(
      updatedGroup.captures.filter(({ name }) => name === "name").map(({ node }) => node.text),
    ).toEqual(["renamed"]);
  });

  it("registers a working grammar from the new package generation after unload", async () => {
    const previousGrammar = lumine.grammars.grammarForScopeName("source.scm");
    await lumine.packages.unloadPackage(PACKAGE_NAME);
    expect(lumine.grammars.grammarForScopeName("source.scm")).toBeUndefined();

    const currentPackage = await lumine.packages.activatePackage(PACKAGE_PATH);
    const currentGrammar = lumine.grammars.grammarForScopeName("source.scm");
    expect(currentGrammar).not.toBe(previousGrammar);
    expect(currentPackage.grammars).toContain(currentGrammar);

    await openQuery("(identifier) @reloaded");
    expect(editor.getGrammar()).toBe(currentGrammar);
    expect(languageMode.tree.rootNode.hasError).toBe(false);
    expect(scopesAt(0, "reloaded")).toContain("variable.other.capture.scm");
  });
});
