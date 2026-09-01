import { useState, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';

type FormatType = 'bold' | 'italic' | 'underline' | 'bullet' | 'ordered';

interface ActiveFormats {
    bold: boolean;
    italic: boolean;
    underline: boolean;
}

interface UseRichEditorReturn {
    editorRef: React.RefObject<HTMLDivElement | null>;
    activeFormats: ActiveFormats;
    handleEditorInput: () => string;
    handleEditorKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    applyFormatting: (formatType: FormatType) => void;
    applyBlockFormatting: (tag: string) => void;
    updateActiveFormats: () => void;
    setEditorContent: (html: string) => void;
    getEditorContent: () => string;
}

export function useRichEditor(): UseRichEditorReturn {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState<ActiveFormats>({
        bold: false,
        italic: false,
        underline: false,
    });

    const updateActiveFormats = useCallback(() => {
        try {
            setActiveFormats({
                bold: document.queryCommandState('bold'),
                italic: document.queryCommandState('italic'),
                underline: document.queryCommandState('underline'),
            });
        } catch {
            // Document command query not supported in current environment
        }
    }, []);

    const handleEditorInput = useCallback((): string => {
        const html = editorRef.current?.innerHTML ?? '';
        updateActiveFormats();
        return html;
    }, [updateActiveFormats]);

    const handleEditorKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey || e.metaKey) {
            const key = e.key.toLowerCase();
            if (key === 'b') {
                e.preventDefault();
                document.execCommand('bold', false);
            } else if (key === 'i') {
                e.preventDefault();
                document.execCommand('italic', false);
            } else if (key === 'u') {
                e.preventDefault();
                document.execCommand('underline', false);
            }
            return;
        }

        if (e.key === ' ' || e.code === 'Space') {
            const sel = window.getSelection();
            if (sel && sel.isCollapsed && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const node = range.startContainer;
                const offset = range.startOffset;

                const parent = node.parentElement;
                if (
                    parent &&
                    ['B', 'I', 'U', 'STRONG', 'EM'].includes(parent.tagName) &&
                    node.nodeType === Node.TEXT_NODE &&
                    offset === node.textContent?.length
                ) {
                    e.preventDefault();

                    const spaceNode = document.createTextNode('\u00A0');
                    if (parent.nextSibling) {
                        parent.parentNode?.insertBefore(spaceNode, parent.nextSibling);
                    } else {
                        parent.parentNode?.appendChild(spaceNode);
                    }

                    const newRange = document.createRange();
                    newRange.setStart(spaceNode, 1);
                    newRange.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(newRange);

                    document.execCommand('removeFormat', false);
                }
            }
        }
    }, []);

    const applyFormatting = useCallback((formatType: FormatType) => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        switch (formatType) {
            case 'bold':
                document.execCommand('bold', false);
                break;
            case 'italic':
                document.execCommand('italic', false);
                break;
            case 'underline':
                document.execCommand('underline', false);
                break;
            case 'bullet':
                document.execCommand('insertUnorderedList', false);
                break;
            case 'ordered':
                document.execCommand('insertOrderedList', false);
                break;
        }
    }, []);

    const applyBlockFormatting = useCallback((tag: string) => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        const sel = window.getSelection();
        const blockTag = tag === 'p' ? '<p>' : `<${tag}>`;

        if (sel && sel.isCollapsed && editorRef.current.innerText.trim().length > 0) {
            return;
        }

        document.execCommand('formatBlock', false, blockTag);
    }, []);

    const setEditorContent = useCallback((html: string) => {
        if (editorRef.current) {
            editorRef.current.innerHTML = DOMPurify.sanitize(html || '');
        }
    }, []);

    const getEditorContent = useCallback((): string => {
        return editorRef.current?.innerHTML ?? '';
    }, []);

    return {
        editorRef,
        activeFormats,
        handleEditorInput,
        handleEditorKeyDown,
        applyFormatting,
        applyBlockFormatting,
        updateActiveFormats,
        setEditorContent,
        getEditorContent,
    };
}
