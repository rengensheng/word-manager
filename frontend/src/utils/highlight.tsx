import React from 'react';

/**
 * 在文本中高亮显示指定单词及其变体
 */
export function highlightWord(text: string, targetWord: string): React.ReactNode {
  if (!text || !targetWord) return text;

  // 获取单词的各种可能形式
  const wordForms = getWordForms(targetWord.toLowerCase());

  // 创建正则表达式，匹配任意形式
  const pattern = wordForms.map(escapeRegExp).join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    // 检查是否是匹配的单词（奇数索引）
    if (index % 2 === 1) {
      return (
        <span key={index} className="font-semibold text-indigo-600 bg-indigo-50 px-0.5 rounded">
          {part}
        </span>
      );
    }
    return part;
  });
}

/**
 * 获取单词的各种可能形式
 */
function getWordForms(word: string): string[] {
  const forms = new Set<string>([word]);

  // 常见的变化规则
  // 复数
  if (word.endsWith('y')) {
    forms.add(word.slice(0, -1) + 'ies'); // city -> cities
  } else if (word.endsWith('s') || word.endsWith('x') || word.endsWith('ch') || word.endsWith('sh')) {
    forms.add(word + 'es'); // bus -> buses
  } else {
    forms.add(word + 's'); // cat -> cats
    forms.add(word + 'es'); // go -> goes
  }

  // 动词形式
  if (word.endsWith('e')) {
    forms.add(word + 'd'); // love -> loved
    forms.add(word + 's'); // loves
  } else if (word.length > 2 && /[^aeiou]$/.test(word.slice(-1)) && /[aeiou]/.test(word.slice(-2, -1))) {
    // CVC 结构，双写尾字母
    forms.add(word + word.slice(-1) + 'ed'); // stop -> stopped
    forms.add(word + word.slice(-1) + 'ing'); // stopping
  }

  forms.add(word + 'ed'); // work -> worked
  forms.add(word + 'ing'); // work -> working

  if (word.endsWith('y')) {
    forms.add(word.slice(0, -1) + 'ied'); // study -> studied
  }

  // 比较级和最高级
  if (word.length <= 5 && !word.endsWith('e')) {
    forms.add(word + 'er'); // fast -> faster
    forms.add(word + 'est'); // fast -> fastest
  }
  forms.add('more ' + word);
  forms.add('most ' + word);

  // 副词形式
  if (!word.endsWith('ly')) {
    if (word.endsWith('y')) {
      forms.add(word.slice(0, -1) + 'ily'); // happy -> happily
    } else if (word.endsWith('le')) {
      forms.add(word.slice(0, -1) + 'y'); // gentle -> gently
    } else {
      forms.add(word + 'ly'); // quick -> quickly
    }
  }

  return Array.from(forms);
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}