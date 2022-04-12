{
    function arr2contstr(arr) {
        return arr.reduce((a, b) => `${a}${b}`, "");
    }
}

start
  = newline* init:component_init flow:component* newline* { return { t: "start", v: [init].concat(flow || []) }; }

component_init
  = content:paragraph { return { t: "paragraph", v: content }; }
  / content:heading { return { t: "heading", v: content }; }
  / content:codeblock { return { t: "codeblock", v: content }; }
  / content:blockquote { return { t: "blockquote", v: content }; }
  / content:list { return { t: "list", v: content }; }
  / content:hrule { return { t: "hrule" }; }

component
  = newline newline+ content:heading { return { t: "heading", v: content }; }
  / newline newline+ content:codeblock { return { t: "codeblock", v: content }; }
  / newline newline+ content:codeblock_noeval { return { t: "codeblock", v: content }; }
  / newline newline+ content:blockquote { return { t: "blockquote", v: content }; }
  / newline newline+ content:list { return { t: "list", v: content }; }
  / newline newline+ content:hrule { return { t: "hrule" }; }
  / newline newline* content:paragraph { return { t: "paragraph", v: content }; } // Should be last as very generic

paragraph
  = content:par_element+ { return { t: "par", v: content }; }

par_element
  = content:italic { return content; }
  / content:bold { return content; }
  / content:codeinline { return content; }
  / content:codeinline_noeval { return content; }
  / content:text { return content; } // Last as very generic

text
  = content:text_char+ { return { t: "text", v: arr2contstr(content) }; }

italic
  = "_" content:text_char+ "_" { return { t: "italic", v: arr2contstr(content) }; }
  / "*" content:text_char+ "*" { return { t: "italic", v: arr2contstr(content) }; }

bold
  = "**" content:text_char+ "**" { return { t: "bold", v: arr2contstr(content) }; }
  / "__" content:text_char+ "__" { return { t: "bold", v: arr2contstr(content) }; }

codeinline
  = "```" content:text_char+ "```" { return { t: "codeinline", v: { run: true, src: arr2contstr(content) } }; }

codeinline_noeval
  = "`" content:text_char+ "`" { return { t: "codeinline", v: { run: false, src: arr2contstr(content) } }; }

heading
  = symb:"#"+ whitespace* content:text_char+ { return { t: "heading_text", v: arr2contstr(content), p: { type: symb.length } }; }

codeblock
  = "```" whitespace* newline char:[^\n\r`] next_char:codeblock_cont { return { run: true, src: char + next_char }; }
codeblock_cont
  = newline "```" { return ""; }
  / char:. next_char:codeblock_cont { return char + next_char; }

codeblock_noeval
  = first_line:codeblock_noeval_line other_lines:codeblock_noeval_anotherline* { return { run: false, src: [first_line].concat(other_lines || []).join("") }; }
codeblock_noeval_line
  = tab content:[^\n\r`]+ { return arr2contstr(content); }
codeblock_noeval_anotherline
  = nl:newline content:codeblock_noeval_line { return `${nl}${content}`; }

blockquote
  = ">" whitespace* content:text_char+ { return arr2contstr(content); }

list
  = "-" whitespace? content:text_char+ { return { t: "listitem", v: content }; }

hrule
  = "---"

// ---------------
// Special symbols
// ---------------

head_delim
  = "#"

text_char
  = [^#\n\r`]

text_char_ns
  = [^#\n\r`*_]

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
