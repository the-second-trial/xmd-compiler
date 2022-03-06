{
    function some() {
        // Todo
    }
}

start
  = flow

flow
  = content:paragraph flow { return content; }
  / heading flow { return {}; }
  / codeblock flow { return {}; }
  / blockquote flow { return {}; }
  / list flow { return {}; }
  / hrule flow { return {}; }
  / "" { return {}; }

paragraph
  = element:par_element next:paragraph* { return { t: "paragraph", v: { el: element, nxt: next } }; }

par_element
  = content:text { return content; }
  / content:italic { return content; }
  / content:bold { return content; }
  / content:codeinline { return content; }

text
  = content:[a-z]+ { return { t: "text", v: content }; }

italic
  = "_" content:[a-z]+ "_" { return { t: "italic", v: content }; }

bold
  = "*" content:[a-z]+ "*" { return { t: "bold", v: content }; }

codeinline
  = "`" content:[a-z]+ "`" { return { t: "codeinline", v: content }; }

heading
  = symb:"#" content:[a-z]+ newline { return { t: "heading", v: content, p: { type: symb.length } }; }

codeblock
  = "```" whitespace* newline content:[a-z]+ newline "```" { return { t: "codeblock", v: content }; }

blockquote
  = ">" whitespace* content:[a-z]+

list
  = "-" whitespace? content:[a-z]+ { return { t: "listitem", v: content }; }

hrule
  = "---"

// ---------------
// Special symbols
// ---------------

text_char
  = !(newline)

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
