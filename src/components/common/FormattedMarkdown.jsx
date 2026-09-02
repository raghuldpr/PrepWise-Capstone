import React from 'react';

/**
 * FormattedMarkdown renders AI markdown text into rich formatted HTML.
 * Handles headings, bold, italic, lists, blockquotes, code blocks, dividers, and inline math.
 */
export default function FormattedMarkdown({ content, className = "" }) {
  if (!content) return null;

  // Render inline formatting (bold, italic, code, links, math)
  const renderInline = (text) => {
    if (!text) return null;

    // Helper to tokenize bold, italic, code, and math
    const parts = [];
    let keyIdx = 0;

    // Regex for inline code (`code`), bold (**text**), italic (*text*), math ($formula$)
    const regex = /(\`[^\`]+\`|\*\*[^*]+\*\*|__[^_]+__|(?:\*|_)[^*_]+(?:\*|_)|(?:\$|\\[()])[^$]+(?:\$|\\[()]))/g;
    
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith('`') && matchText.endsWith('`')) {
        parts.push(
          <code key={keyIdx++} className="bg-neutral-800 text-amber-300 font-mono text-[0.85em] px-1.5 py-0.5 rounded border border-neutral-700">
            {matchText.slice(1, -1)}
          </code>
        );
      } else if ((matchText.startsWith('**') && matchText.endsWith('**')) || (matchText.startsWith('__') && matchText.endsWith('__'))) {
        parts.push(
          <strong key={keyIdx++} className="font-bold text-white">
            {renderInline(matchText.slice(2, -2))}
          </strong>
        );
      } else if ((matchText.startsWith('*') && matchText.endsWith('*')) || (matchText.startsWith('_') && matchText.endsWith('_'))) {
        parts.push(
          <em key={keyIdx++} className="italic text-neutral-300">
            {renderInline(matchText.slice(1, -1))}
          </em>
        );
      } else if (matchText.startsWith('$') && matchText.endsWith('$')) {
        parts.push(
          <span key={keyIdx++} className="font-mono text-amber-300 bg-neutral-900 px-1 py-0.5 rounded text-[0.9em]">
            {matchText.slice(1, -1)}
          </span>
        );
      } else {
        parts.push(matchText);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Parse lines into blocks
  const lines = content.split('\n');
  const blocks = [];
  let currentList = null;
  let currentCodeBlock = null;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code block toggle (```)
    if (trimmed.startsWith('```')) {
      if (currentCodeBlock) {
        blocks.push(
          <pre key={`code-${index}`} className="bg-[#181818] text-neutral-200 p-3 rounded-xl border border-neutral-800 font-mono text-xs overflow-x-auto my-3">
            <code>{currentCodeBlock.join('\n')}</code>
          </pre>
        );
        currentCodeBlock = null;
      } else {
        if (currentList) {
          blocks.push(currentList);
          currentList = null;
        }
        currentCodeBlock = [];
      }
      return;
    }

    if (currentCodeBlock) {
      currentCodeBlock.push(line);
      return;
    }

    // Horizontal rule (--- or ***)
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push(<hr key={`hr-${index}`} className="my-4 border-neutral-800" />);
      return;
    }

    // Headings (#, ##, ###, ####)
    if (trimmed.startsWith('#')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }

      const level = trimmed.match(/^#+/)[0].length;
      const headingText = trimmed.replace(/^#+\s*/, '');

      if (level === 1) {
        blocks.push(<h1 key={`h1-${index}`} className="text-xl font-bold text-white mt-5 mb-2 font-heading tracking-tight border-b border-neutral-800 pb-1">{renderInline(headingText)}</h1>);
      } else if (level === 2) {
        blocks.push(<h2 key={`h2-${index}`} className="text-lg font-bold text-amber-400 mt-4 mb-2 font-heading tracking-tight">{renderInline(headingText)}</h2>);
      } else if (level === 3) {
        blocks.push(<h3 key={`h3-${index}`} className="text-base font-bold text-[#C85232] mt-3 mb-1 font-heading">{renderInline(headingText)}</h3>);
      } else {
        blocks.push(<h4 key={`h4-${index}`} className="text-sm font-semibold text-neutral-200 mt-2 mb-1 font-heading">{renderInline(headingText)}</h4>);
      }
      return;
    }

    // Blockquote (> text)
    if (trimmed.startsWith('>')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const quoteText = trimmed.replace(/^>\s*/, '');
      blocks.push(
        <blockquote key={`quote-${index}`} className="border-l-4 border-amber-500 bg-amber-950/20 text-amber-200 p-3 rounded-r-xl my-2 text-xs sm:text-sm font-medium">
          {renderInline(quoteText)}
        </blockquote>
      );
      return;
    }

    // Unordered List (* item, - item)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.substring(2);
      if (!currentList || currentList.type !== 'ul') {
        if (currentList) blocks.push(currentList);
        currentList = {
          type: 'ul',
          key: `ul-${index}`,
          items: []
        };
      }
      currentList.items.push(itemText);
      return;
    }

    // Ordered List (1. item, 2. item)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      const itemText = olMatch[2];
      if (!currentList || currentList.type !== 'ol') {
        if (currentList) blocks.push(currentList);
        currentList = {
          type: 'ol',
          key: `ol-${index}`,
          items: []
        };
      }
      currentList.items.push(itemText);
      return;
    }

    // End current list if line is not a list item
    if (currentList) {
      const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
      const listClass = currentList.type === 'ul' 
        ? 'list-disc list-inside space-y-1.5 my-2 pl-2 text-neutral-300' 
        : 'list-decimal list-inside space-y-1.5 my-2 pl-2 text-neutral-300';

      blocks.push(
        <ListTag key={currentList.key} className={listClass}>
          {currentList.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <span className="text-neutral-200">{renderInline(item)}</span>
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }

    // Empty line / paragraph break
    if (!trimmed) {
      blocks.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Regular paragraph line
    blocks.push(
      <p key={`p-${index}`} className="my-1 leading-relaxed text-neutral-200">
        {renderInline(line)}
      </p>
    );
  });

  // Flush remaining current list if any
  if (currentList) {
    const ListTag = currentList.type === 'ul' ? 'ul' : 'ol';
    const listClass = currentList.type === 'ul' 
      ? 'list-disc list-inside space-y-1.5 my-2 pl-2 text-neutral-300' 
      : 'list-decimal list-inside space-y-1.5 my-2 pl-2 text-neutral-300';

    blocks.push(
      <ListTag key={currentList.key} className={listClass}>
        {currentList.items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            <span className="text-neutral-200">{renderInline(item)}</span>
          </li>
        ))}
      </ListTag>
    );
  }

  return (
    <div className={`formatted-markdown space-y-1 ${className}`}>
      {blocks}
    </div>
  );
}
