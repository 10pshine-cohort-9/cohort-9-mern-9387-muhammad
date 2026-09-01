import { type Note } from '../types/note';

export const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export function sanitizeHtmlInput(input: string): string {
    if (!input) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(input, 'text/html');

    const dangerousTags = ['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'STYLE', 'FORM', 'INPUT', 'BUTTON', 'META', 'LINK'];
    for (const tag of dangerousTags) {
        const elements = doc.body.getElementsByTagName(tag);
        while (elements.length > 0) {
            elements[0].remove();
        }
    }

    const allElements = doc.body.querySelectorAll('*');
    for (const el of allElements) {
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
            if (attr.name.toLowerCase().startsWith('on')) {
                el.removeAttribute(attr.name);
            }
            if (['href', 'src'].includes(attr.name.toLowerCase())) {
                const val = attr.value.trim().toLowerCase();
                if (val.startsWith('javascript:') || val.startsWith('data:')) {
                    el.setAttribute(attr.name, '#');
                }
            }
        }
    }

    return doc.body.innerHTML;
}

export function htmlToMarkdown(html: string): string {
    if (!html) return '';

    const sanitizedHtml = sanitizeHtmlInput(html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedHtml, 'text/html');

    return walkDomNode(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

function walkDomNode(node: Node): string {
    let result = '';

    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];

        if (child.nodeType === Node.TEXT_NODE) {
            result += child.textContent || '';
            continue;
        }

        if (child.nodeType !== Node.ELEMENT_NODE) {
            continue;
        }

        const el = child as HTMLElement;
        const tagName = el.tagName.toUpperCase();
        const innerText = walkDomNode(el);

        switch (tagName) {
            case 'H1':
                result += `# ${innerText}\n\n`;
                break;
            case 'H2':
                result += `## ${innerText}\n\n`;
                break;
            case 'H3':
                result += `### ${innerText}\n\n`;
                break;
            case 'H4':
                result += `#### ${innerText}\n\n`;
                break;
            case 'H5':
                result += `##### ${innerText}\n\n`;
                break;
            case 'H6':
                result += `###### ${innerText}\n\n`;
                break;
            case 'B':
            case 'STRONG':
                result += `**${innerText}**`;
                break;
            case 'I':
            case 'EM':
                result += `*${innerText}*`;
                break;
            case 'U':
                result += `<u>${innerText}</u>`;
                break;
            case 'UL':
                result += `\n${walkListItems(el, false)}\n`;
                break;
            case 'OL':
                result += `\n${walkListItems(el, true)}\n`;
                break;
            case 'P':
            case 'DIV':
                result += `${innerText}\n\n`;
                break;
            case 'BR':
                result += '\n';
                break;
            default:
                result += innerText;
                break;
        }
    }

    return result;
}

function walkListItems(listEl: HTMLElement, isOrdered: boolean): string {
    const items: string[] = [];
    const children = listEl.children;

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.tagName.toUpperCase() === 'LI') {
            const content = walkDomNode(child).trim();
            const prefix = isOrdered ? `${i + 1}. ` : '- ';
            items.push(`${prefix}${content}`);
        }
    }

    return items.join('\n');
}

export function markdownToHtml(md: string): string {
    if (!md) return '';

    const lines = md.split('\n');
    const htmlLines: string[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            closeLists();
            continue;
        }

        const headingMatch = line.match(/^(#{1,6})\s+(\S.*)$/);
        if (headingMatch) {
            closeLists();
            const level = headingMatch[1].length;
            const text = parseInlineMarkdown(headingMatch[2]);
            htmlLines.push(`<h${level}>${text}</h${level}>`);
            continue;
        }

        const ulMatch = line.match(/^[-*]\s+(\S.*)$/);
        if (ulMatch) {
            if (inOrderedList) closeLists();
            if (!inUnorderedList) {
                htmlLines.push('<ul>');
                inUnorderedList = true;
            }
            htmlLines.push(`<li>${parseInlineMarkdown(ulMatch[1])}</li>`);
            continue;
        }

        const olMatch = line.match(/^\d+\.\s+(\S.*)$/);
        if (olMatch) {
            if (inUnorderedList) closeLists();
            if (!inOrderedList) {
                htmlLines.push('<ol>');
                inOrderedList = true;
            }
            htmlLines.push(`<li>${parseInlineMarkdown(olMatch[1])}</li>`);
            continue;
        }

        closeLists();
        htmlLines.push(`<p>${parseInlineMarkdown(line)}</p>`);
    }

    closeLists();

    return sanitizeHtmlInput(htmlLines.join(''));

    function closeLists() {
        if (inUnorderedList) {
            htmlLines.push('</ul>');
            inUnorderedList = false;
        }
        if (inOrderedList) {
            htmlLines.push('</ol>');
            inOrderedList = false;
        }
    }
}

function parseInlineMarkdown(text: string): string {
    let result = text;
    result = result.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    result = result.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
    result = result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    result = result.replace(/\*(.*?)\*/g, '<i>$1</i>');

    return result;
}

export function generateNoteMarkdown(note: Note): string {
    const titleHeader = `# ${note.title || 'Untitled Note'}`;
    const tagsHeader = note.tags && note.tags.length > 0
        ? `> Tags: ${note.tags.map((t) => `#${t}`).join(' ')}\n\n`
        : '';
    const bodyContent = htmlToMarkdown(note.content || '');

    return `${titleHeader}\n\n${tagsHeader}${bodyContent}`.trim();
}

export function downloadNoteAsMarkdown(note: Note): void {
    const markdownContent = generateNoteMarkdown(note);
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const cleanTitle = (note.title || 'note')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    link.href = url;
    link.download = `${cleanTitle || 'note'}.md`;
    link.click();
    URL.revokeObjectURL(url);
}

export function parseMarkdownFile(text: string, fileName: string): { title: string; content: string; tags: string[] } {
    const lines = text.split('\n');
    let title = '';
    const tags: string[] = [];
    const contentLines: string[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!title && line.startsWith('# ')) {
            title = line.slice(2).trim();
            continue;
        }

        if (line.toLowerCase().startsWith('> tags:') || line.toLowerCase().startsWith('tags:')) {
            const tagMatches = line.match(/#([\w-]+)/g);
            if (tagMatches) {
                tagMatches.forEach((t) => tags.push(t.replace('#', '')));
            }
            continue;
        }

        contentLines.push(rawLine);
    }

    if (!title) {
        title = fileName.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
        title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    const htmlContent = markdownToHtml(contentLines.join('\n'));

    return {
        title,
        content: htmlContent || '<p></p>',
        tags,
    };
}
