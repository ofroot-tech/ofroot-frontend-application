"use client";

import * as React from 'react';

export type TagInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
  maxTags?: number;
};

const normalizeTag = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\-\s]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);

export function TagInput({ value, onChange, label, placeholder = 'Add a tag and press Enter', maxTags = 12 }: TagInputProps) {
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const addTag = React.useCallback(
    (raw: string) => {
      const tag = normalizeTag(raw);
      if (!tag) return;
      if (value.includes(tag)) {
        setDraft('');
        return;
      }
      if (value.length >= maxTags) return;
      onChange([...value, tag]);
      setDraft('');
    },
    [value, onChange, maxTags]
  );

  const removeTag = React.useCallback(
    (tag: string) => {
      onChange(value.filter((t) => t !== tag));
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  return (
    <div>
      {label ? (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      ) : null}
      <div className="rounded-md border bg-white px-2 py-2 text-sm focus-within:ring-2 focus-within:ring-[#20b2aa] focus-within:border-[#20b2aa]">
        <div className="flex flex-wrap items-center gap-1">
          {value.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="group inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-violet-800 border border-violet-100 hover:bg-violet-100"
            >
              <span>#{tag}</span>
              <span className="text-xs text-violet-500 group-hover:text-violet-700">×</span>
            </button>
          ))}
          {value.length < maxTags ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag(draft);
                } else if (e.key === 'Backspace' && !draft && value.length) {
                  e.preventDefault();
                  removeTag(value[value.length - 1]);
                }
              }}
              placeholder={placeholder}
              className="flex-1 min-w-[120px] border-none bg-transparent focus:outline-none py-1"
            />
          ) : null}
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          {value.length}/{maxTags} tags
        </div>
      </div>
    </div>
  );
}
