import { describe, it, expect } from 'vitest';
import {
    htmlToMarkdown,
    markdownToHtml,
    generateNoteMarkdown,
    parseMarkdownFile,
    sanitizeHtmlInput,
    MAX_IMPORT_FILE_SIZE_BYTES,
} from '../markdown';
import type { Note } from '../../types/note';

describe('markdown utility', () => {
    describe('10 MB file size limit constant', () => {
        it('defines MAX_IMPORT_FILE_SIZE_BYTES as exactly 10 MB', () => {
            expect(MAX_IMPORT_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
        });
    });

    describe('XSS & HTML Injection Sanitization', () => {
        it('strips <script> tags and inline script handlers', () => {
            const malformed = '<script>alert("XSS")</script><p>Safe text</p>';
            const sanitized = sanitizeHtmlInput(malformed);
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('<p>Safe text</p>');
        });

        it('neutralizes onerror, onload, and javascript: URIs', () => {
            const maliciousHtml = '<img src="x" onerror="alert(1)"><a href="javascript:alert(2)">Link</a><svg onload="alert(3)"></svg>';
            const sanitized = sanitizeHtmlInput(maliciousHtml);
            expect(sanitized).not.toContain('onerror=');
            expect(sanitized).not.toContain('onload=');
            expect(sanitized).not.toContain('javascript:');
        });

        it('sanitizes imported Markdown containing script or event payloads', () => {
            const maliciousMd = '# Title\n\n<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>';
            const html = markdownToHtml(maliciousMd);
            expect(html).not.toContain('<script>');
            // The raw <img> tag is entity-escaped by parseInlineMarkdown (< becomes &lt;),
            // so 'onerror' appears only as harmless display text, never as an executable attribute.
            expect(html).not.toMatch(/<img[^>]+onerror/i);
        });
    });

    describe('Headings H1-H6', () => {
        it('converts H1 through H6 headings bidirectionally', () => {
            const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>';
            const md = htmlToMarkdown(html);
            expect(md).toContain('# H1');
            expect(md).toContain('## H2');
            expect(md).toContain('### H3');
            expect(md).toContain('#### H4');
            expect(md).toContain('##### H5');
            expect(md).toContain('###### H6');

            const restoredHtml = markdownToHtml(md);
            expect(restoredHtml).toContain('<h1>H1</h1>');
            expect(restoredHtml).toContain('<h2>H2</h2>');
            expect(restoredHtml).toContain('<h3>H3</h3>');
            expect(restoredHtml).toContain('<h4>H4</h4>');
            expect(restoredHtml).toContain('<h5>H5</h5>');
            expect(restoredHtml).toContain('<h6>H6</h6>');
        });
    });

    describe('Ordered and Unordered Lists', () => {
        it('converts unordered lists (ul/li) to bullet markdown (- item)', () => {
            const html = '<ul><li>Alpha</li><li>Beta</li></ul>';
            const md = htmlToMarkdown(html);
            expect(md).toContain('- Alpha');
            expect(md).toContain('- Beta');

            const restoredHtml = markdownToHtml(md);
            expect(restoredHtml).toContain('<ul>');
            expect(restoredHtml).toContain('<li>Alpha</li>');
            expect(restoredHtml).toContain('<li>Beta</li>');
        });

        it('converts ordered lists (ol/li) to numbered markdown (1. item, 2. item)', () => {
            const html = '<ol><li>First step</li><li>Second step</li></ol>';
            const md = htmlToMarkdown(html);
            expect(md).toContain('1. First step');
            expect(md).toContain('2. Second step');

            const restoredHtml = markdownToHtml(md);
            expect(restoredHtml).toContain('<ol>');
            expect(restoredHtml).toContain('<li>First step</li>');
            expect(restoredHtml).toContain('<li>Second step</li>');
        });
    });

    describe('Underline controlled extension (<u>)', () => {
        it('preserves <u>underline</u> formatting in HTML->MD and MD->HTML', () => {
            const html = '<p>This is <u>underlined text</u>.</p>';
            const md = htmlToMarkdown(html);
            expect(md).toContain('<u>underlined text</u>');

            const restoredHtml = markdownToHtml(md);
            expect(restoredHtml).toContain('<u>underlined text</u>');
        });
    });

    describe('generateNoteMarkdown & parseMarkdownFile', () => {
        it('generates Markdown document with title header and tag metadata', () => {
            const note: Note = {
                _id: '1',
                title: 'Architecture Blueprint',
                content: '<p>Key <b>highlights</b> and <u>objectives</u>.</p>',
                tags: ['architecture', 'v1'],
                isPinned: true,
                isArchived: false,
                isTrashed: false,
            };

            const md = generateNoteMarkdown(note);
            expect(md).toContain('# Architecture Blueprint');
            expect(md).toContain('> Tags: #architecture #v1');
            expect(md).toContain('Key **highlights** and <u>objectives</u>.');
        });

        it('parses title, tags, and HTML content from Markdown text', () => {
            const mdText = `# Sprint Plan\n\n> Tags: #sprint #dev\n\n1. Review backlog\n2. Assign tasks`;
            const parsed = parseMarkdownFile(mdText, 'plan.md');

            expect(parsed.title).toBe('Sprint Plan');
            expect(parsed.tags).toEqual(['sprint', 'dev']);
            expect(parsed.content).toContain('<ol>');
            expect(parsed.content).toContain('<li>Review backlog</li>');
        });

        it('uses filename fallback for title if no H1 heading exists', () => {
            const mdText = `Direct notes content without H1 header.`;
            const parsed = parseMarkdownFile(mdText, 'project-spec.md');

            expect(parsed.title).toBe('Project spec');
            expect(parsed.content).toContain('Direct notes content without H1 header.');
        });
    });
});
