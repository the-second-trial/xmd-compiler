{{def=acr1:My acronym 1}}
{{def=acr2:My acronym 2}}

{{def=acr3:My acronym 3}}

{{def=flag1}}

{{lang=en}}

# Content with directives
Paragraph text with no newline from heading and my {{def=acr1}}.

## Second heading separated by a newline from prev
Paragraph _text_ with no *newline* from heading.

---

## Second heading separated by many newlines from prev
Paragraph __text__ with no **newline** from {{def=acr2}} heading.

## Second heading not separated by a newline from prev

Paragraph text *separated* with newline {{def=acr3}} from heading.
There is an empty def also: '{{def=flag1}}'.