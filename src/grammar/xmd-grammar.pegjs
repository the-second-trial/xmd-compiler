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
  = newline newline* content:paragraph { return { t: "paragraph", v: content }; }
  / newline newline+ content:heading { return { t: "heading", v: content }; }
  / newline newline+ content:codeblock { return { t: "codeblock", v: content }; }
  / newline newline+ content:blockquote { return { t: "blockquote", v: content }; }
  / newline newline+ content:list { return { t: "list", v: content }; }
  / newline newline+ content:hrule { return { t: "hrule" }; }

paragraph
  = content:par_element next:paragraph { return { t: "par", v: { cnt: content, nxt: next } }; }
  / content:par_element { return { t: "par_el", v: content }; }

par_element
  = content:text { return content; }
  / content:italic { return content; }
  / content:bold { return content; }
  / content:codeinline { return content; }

text
  = content:text_char+ { return { t: "text", v: arr2contstr(content) }; }

italic
  = "_" content:text_char+ "_" { return { t: "italic", v: arr2contstr(content) }; }

bold
  = "*" content:text_char+ "*" { return { t: "bold", v: arr2contstr(content) }; }

codeinline
  = "`" content:text_char+ "`" { return { t: "codeinline", v: arr2contstr(content) }; }

heading
  = symb:"#" content:text_char+ { return { t: "heading_text", v: arr2contstr(content), p: { type: symb.length } }; }

codeblock
  = "```" whitespace* newline content:text_char+ newline "```" { return arr2contstr(content); }

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
  = [^#\n\r]

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
