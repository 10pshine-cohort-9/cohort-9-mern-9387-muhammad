import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRichEditor } from '../useRichEditor';

describe('useRichEditor hook', () => {
  it('initializes with default activeFormats and exposes helpers', () => {
    const { result } = renderHook(() => useRichEditor());

    expect(result.current.activeFormats).toEqual({
      bold: false,
      italic: false,
      underline: false,
    });
    expect(result.current.editorRef.current).toBeNull();
  });

  it('executes formatting commands when editorRef is assigned', () => {
    document.execCommand = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useRichEditor());

    const div = document.createElement('div');
    div.focus = vi.fn();
    div.innerText = '';
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    act(() => {
      result.current.applyFormatting('bold');
      result.current.applyFormatting('italic');
      result.current.applyFormatting('underline');
      result.current.applyFormatting('bullet');
      result.current.applyFormatting('ordered');
      result.current.applyBlockFormatting('h2');
    });

    expect(document.execCommand).toHaveBeenCalledWith('bold', false);
    expect(document.execCommand).toHaveBeenCalledWith('italic', false);
    expect(document.execCommand).toHaveBeenCalledWith('underline', false);
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false);
    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false);
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>');
  });

  it('handles setEditorContent and getEditorContent', () => {
    const { result } = renderHook(() => useRichEditor());
    const div = document.createElement('div');
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    act(() => {
      result.current.setEditorContent('<p>Sanitized content</p>');
    });

    expect(result.current.getEditorContent()).toBe('<p>Sanitized content</p>');
  });
});
