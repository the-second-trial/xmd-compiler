{
    function arr2contstr(arr) {
        return arr.reduce((a, b) => `${a}${b}`, "");
    }
}

// Whitespaces specified here are covering the BOF and EOF
start
  = newline* init:component_init flow:component* newline* { return { t: "start", v: [init].concat(flow || []) }; }

component_init
  = content:root_directive { return { t: "rootdirect", v: content }; }
  / content:paragraph { return { t: "paragraph", v: content }; }
  / content:heading { return { t: "heading", v: content }; }
  / content:codeblock { return { t: "codeblock", v: content }; }
  / content:blockquote { return { t: "blockquote", v: content }; }
  / hrule { return { t: "hrule" }; } // Must come before list
  / content:list { return { t: "list", v: content }; }

// Here we cover whitespaces between different syntax blocks
component
  = newline newline+ content:heading { return { t: "heading", v: content }; }
  / newline newline+ content:codeblock { return { t: "codeblock", v: content }; }
  / newline newline+ content:codeblock_noeval { return { t: "codeblock", v: content }; }
  / newline newline+ content:eqblock { return { t: "eqblock", v: content }; }
  / newline newline+ content:blockquote { return { t: "blockquote", v: content }; }
  / newline newline+ content:list { return { t: "list", v: content }; }
  / newline newline+ content:hrule { return { t: "hrule" }; }
  / newline+ content:image { return { t: "image", v: content }; }
  / newline* content:root_directive { return { t: "rootdirect", v: content }; }
  / newline newline* content:paragraph { return { t: "paragraph", v: content }; } // Should be last as very generic

image
  = whitespace* "!" "[" alt_text:[^\n\r\]]+ "]" "(" file_path:[^'"\n\r ]+ whitespace* imm_title:image_title? ")" whitespace* ext:extension_string? whitespace* { return { alt: arr2contstr(alt_text), path: arr2contstr(file_path), title: imm_title, ext: ext }; }
image_title
  = ["'] value:[^'"\n\r]+ ["'] { return arr2contstr(value); }

paragraph
  = content:par_element+ { return { t: "par", v: content }; }

par_element
  = content:italic { return content; }
  / content:bold { return content; }
  / content:eqinline { return content; }
  / content:codeinline { return content; }
  / content:codeinline_noeval { return content; }
  / content:inline_directive { return { t: "inlinedirect", v: content }; }
  / content:text { return content; } // Last as very generic

text
  = content:text_char_ns+ { return { t: "text", v: arr2contstr(content) }; }

italic
  = "_" content:[^#\n\r`_]+ "_" { return { t: "italic", v: arr2contstr(content) }; }
  / "*" content:[^#\n\r`*]+ "*" { return { t: "italic", v: arr2contstr(content) }; }

bold
  = "**" content:[^#\n\r`*]+ "**" { return { t: "bold", v: arr2contstr(content) }; }
  / "__" content:[^#\n\r`_]+ "__" { return { t: "bold", v: arr2contstr(content) }; }

eqinline
  = "$" content:[^#\n\r`$]+ "$" { return { t: "eqinline", v: arr2contstr(content) }; }

codeinline
  = "```" content:text_char+ "```" { return { t: "codeinline", v: { run: true, src: arr2contstr(content) } }; }

codeinline_noeval
  = "`" content:text_char+ "`" { return { t: "codeinline", v: { run: false, src: arr2contstr(content) } }; }

heading
  = symb:"#"+ whitespace* content:[^#\n\r`{]+ whitespace* ext:extension_string? { return { t: "heading_text", v: arr2contstr(content), p: { type: symb.length }, ext: ext }; }

codeblock
  = "```" whitespace* ext:extension_string? whitespace* newline char:[^\n\r`] next_char:codeblock_cont { return { run: true, src: char + next_char, ext: ext }; }
codeblock_cont
  = newline "```" { return ""; }
  / char:. next_char:codeblock_cont { return char + next_char; }

codeblock_noeval
  = first_line:codeblock_noeval_line other_lines:codeblock_noeval_anotherline* { return { run: false, src: [first_line].concat(other_lines || []).join("") }; }
codeblock_noeval_line
  = tab content:[^\n\r`]+ { return arr2contstr(content); }
codeblock_noeval_anotherline
  = nl:newline content:codeblock_noeval_line { return `${nl}${content}`; }

eqblock
  = "$$" whitespace* newline char:[^\n\r`] next_char:eqblock_cont { return char + next_char; }
eqblock_cont
  = newline "$$" { return ""; }
  / char:. next_char:eqblock_cont { return char + next_char; }

blockquote
  = ">" whitespace* content:text_char+ { return arr2contstr(content); }

list
  = "-" whitespace content:text_char+ { return { t: "listitem", v: content }; }

hrule
  = "---"

// ----------
// Directives
// ----------

root_directive
  = extension_string

inline_directive
  = extension_string

// ----------
// Extensions
// ----------

extension_string
  = ext_delim_open one:extension_string_one others:extension_string_two* ext_delim_close { return { t: "ext", v: [one].concat(others || []) } }
extension_string_one
  = whitespace* clause:extension_clause whitespace* { return clause; }
extension_string_two
  = extension_clause_sep whitespace* clause:extension_clause whitespace* { return clause; }

extension_clause
  = name:alphanumeric_char+ value:extension_clause_cont? { return { t: "extclause", v: { name: arr2contstr(name), value: value } }; }
extension_clause_cont
  = extension_clause_assign value:[^#\n\r{}]+ { return arr2contstr(value); }

extension_clause_sep
  = ","
extension_clause_assign
  = "="

// ---------------
// Special symbols
// ---------------

ext_delim_open
  = "{{"

ext_delim_close
  = "}}"

head_delim
  = "#"

text_char
  = [^#\n\r`]

text_char_ns
  = [^#\n\r`*_${}]

tab
  = "\t"
  / "    "

alphanumeric_char
  = [a-zA-Z0-9]

/* Modeled after ECMA-262, 5th ed., 7.2. */
whitespace
  = [ \t\v\f\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]

/* Modeled after ECMA-262, 5th ed., 7.3. */
newline
  = "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"
