describe("Conservative tree-sitter-query indentation", () => {
  let editor;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-tree-sitter-query");
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.scm"));
    editor.update({ tabLength: 4, softTabs: true });
    await editor.whenGrammarSettled();
  });

  afterEach(() => editor?.destroy());

  for (const [name, source, row, columns] of [
    ["a completed named node", "(identifier) @name", 0, 0],
    ["a nested child", "(call_expression\n    (identifier) @name\n)", 1, 4],
    ["a completed predicate", '((identifier) @name\n    (#eq? @name "value")\n)', 1, 4],
    ["an opening node", "(call_expression\n)", 0, 4],
    ["a quoted delimiter", "(identifier) @name ; ( [", 0, 0],
  ]) {
    it(`keeps the intended level after ${name}`, async () => {
      editor.setText(source);
      await editor.whenGrammarSettled();
      editor.setCursorBufferPosition([row, Infinity]);
      editor.insertText("\n", { autoIndent: true, autoIndentNewline: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(row + 1)).toBe(" ".repeat(columns));
      expect(editor.getCursorBufferPosition().column).toBe(columns);
    });
  }

  it("dedents a closing delimiter only when it is typed at the start of a row", async () => {
    editor.setText("(call_expression" + "\n    ");
    await editor.whenGrammarSettled();
    editor.setCursorBufferPosition([1, Infinity]);
    editor.insertText(")", { autoIndent: true, autoDecreaseIndent: true });
    await editor.whenGrammarSettled();
    expect(editor.lineTextForBufferRow(1)).toBe(")");
  });
});
