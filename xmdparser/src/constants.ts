/** Global constants. */
export const Constants = {
    OutputTypes: {
        HTML_TUFTE: "html_tufte",
        TEX_TUFTE: "tex_tufte",
        TEX_DOC: "tex_doc",
        HTML_SLIDES: "html_slides",
    },
    NodeTypes: {
        START: "start",
        HEADING: "heading",
        PARAGRAPH: "paragraph",
        PARAGRAPH_INNER: "par",
        PAR_TEXT: "text",
        PAR_ITALIC: "italic",
        PAR_BOLD: "bold",
        PAR_CODEINLINE: "codeinline",
        PAR_EQINLINE: "eqinline",
        CODEBLOCK: "codeblock",
        EQBLOCK: "eqblock",
        IMAGE: "image",
        HRULE: "hrule",
        ROOT_DIRECTIVE: "rootdirect",
        INLINE_DIRECTIVE: "inlinedirect",
    },
    Directives: {
        DEFINITION: "def",
        LANG: "lang",
        IMPORT: "import",
        IF: "if",
    },
    ExtendedNodeTypes: {
        THEOREM: "theorem",
    },
    PySrv: {
        SRV_PING_MAX_ATTEMPTS_COUNT: 10,
        SRV_PING_WAIT_RETRY_MS: 1000,
    },
    Keywords: {
        ABSTRACT: "abstract",
        AUTHOR: "author",
    },
};
