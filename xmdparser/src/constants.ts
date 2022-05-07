/** Global constants. */
export const Constants = {
    OutputTypes: {
        HTML_TUFTE: "html_tufte",
        TEX_TUFTE: "tex_tufte",
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
        ABBREVATION: "a",
        IMPORT: "import",
    },
    ExtendedNodeTypes: {
        THEOREM: "theorem",
    },
    PySrv: {
        SRV_PING_MAX_ATTEMPTS_COUNT: 10,
        SRV_PING_WAIT_RETRY_MS: 1000,
    },
};
