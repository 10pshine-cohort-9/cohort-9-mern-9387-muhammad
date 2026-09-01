import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRichEditor } from '../useRichEditor';

describe('useRichEditor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useRichEditor());

    expect(result.current.activeFormats).toEqual({ bold: false, italic: false, underline: false });
    expect(result.current.editorRef.current).toBeNull();
  });

  it('applies all inline formatting commands', () => {
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
    });

    expect(document.execCommand).toHaveBeenCalledWith('bold', false);
    expect(document.execCommand).toHaveBeenCalledWith('italic', false);
    expect(document.execCommand).toHaveBeenCalledWith('underline', false);
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false);
    expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false);
  });

  it('does nothing when editorRef is null', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    act(() => { result.current.applyFormatting('bold'); });
    expect(document.execCommand).not.toHaveBeenCalled();

    act(() => { result.current.applyBlockFormatting('h2'); });
    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('applies block formatting for heading and paragraph', () => {
    document.execCommand = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useRichEditor());

    const div = document.createElement('div');
    div.focus = vi.fn();
    div.innerText = '';
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    act(() => { result.current.applyBlockFormatting('h2'); });
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>');

    act(() => { result.current.applyBlockFormatting('p'); });
    expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<p>');
  });

  it('skips block formatting when cursor is collapsed and editor has content', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    const div = document.createElement('div');
    div.focus = vi.fn();
    div.innerText = 'some text';
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    vi.spyOn(window, 'getSelection').mockReturnValue({
      isCollapsed: true,
    } as unknown as Selection);

    act(() => { result.current.applyBlockFormatting('h2'); });
    expect(document.execCommand).not.toHaveBeenCalledWith('formatBlock', false, '<h2>');
  });

  it('setEditorContent and getEditorContent round-trip', () => {
    const { result } = renderHook(() => useRichEditor());
    const div = document.createElement('div');
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    act(() => { result.current.setEditorContent('<p>Hello</p>'); });
    expect(result.current.getEditorContent()).toBe('<p>Hello</p>');
  });

  it('setEditorContent sanitizes empty/falsy input', () => {
    const { result } = renderHook(() => useRichEditor());
    const div = document.createElement('div');
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    act(() => { result.current.setEditorContent(''); });
    expect(div.innerHTML).toBe('');
  });

  it('getEditorContent returns empty string when ref is null', () => {
    const { result } = renderHook(() => useRichEditor());
    expect(result.current.getEditorContent()).toBe('');
  });

  it('handleEditorInput returns innerHTML and updates formats', () => {
    document.queryCommandState = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useRichEditor());

    const div = document.createElement('div');
    div.innerHTML = '<b>bold text</b>';
    (result.current.editorRef as { current: HTMLDivElement | null }).current = div;

    let html = '';
    act(() => { html = result.current.handleEditorInput(); });

    expect(html).toBe('<b>bold text</b>');
    expect(result.current.activeFormats.bold).toBe(true);
  });

  it('updateActiveFormats handles queryCommandState throwing', () => {
    document.queryCommandState = vi.fn().mockImplementation(() => {
      throw new Error('Not supported');
    });

    const { result } = renderHook(() => useRichEditor());
    act(() => { result.current.updateActiveFormats(); });

    expect(result.current.activeFormats).toEqual({ bold: false, italic: false, underline: false });
  });

  it('handleEditorKeyDown applies bold on Ctrl+B', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    const event = {
      ctrlKey: true,
      metaKey: false,
      key: 'b',
      preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLDivElement>;

    act(() => { result.current.handleEditorKeyDown(event); });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('bold', false);
  });

  it('handleEditorKeyDown applies italic on Ctrl+I', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    act(() => {
      result.current.handleEditorKeyDown({
        ctrlKey: true, metaKey: false, key: 'i', preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>);
    });

    expect(document.execCommand).toHaveBeenCalledWith('italic', false);
  });

  it('handleEditorKeyDown applies underline on Ctrl+U', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    act(() => {
      result.current.handleEditorKeyDown({
        ctrlKey: true, metaKey: false, key: 'u', preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>);
    });

    expect(document.execCommand).toHaveBeenCalledWith('underline', false);
  });

  it('handleEditorKeyDown ignores non-shortcut Ctrl keys', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    act(() => {
      result.current.handleEditorKeyDown({
        ctrlKey: true, metaKey: false, key: 'z', preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>);
    });

    expect(document.execCommand).not.toHaveBeenCalled();
  });

  it('handleEditorKeyDown does nothing for regular keys', () => {
    document.execCommand = vi.fn();
    const { result } = renderHook(() => useRichEditor());

    act(() => {
      result.current.handleEditorKeyDown({
        ctrlKey: false, metaKey: false, key: 'a', code: 'KeyA', preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLDivElement>);
    });

    expect(document.execCommand).not.toHaveBeenCalled();
  });
});
