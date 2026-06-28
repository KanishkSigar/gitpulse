// ============================================
// GitPulse — Language colors (GitHub Linguist palette, subset)
// Shared by the language donut and repo cards.
// ============================================

export const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', 'C#': '#178600', PHP: '#4F5D95', Ruby: '#701516',
  Go: '#00ADD8', Swift: '#F05138', Kotlin: '#A97BFF', Rust: '#dea584', Dart: '#00B4AB',
  Scala: '#c22d40', 'Objective-C': '#438eff', Perl: '#0298c3', Lua: '#000080',
  Haskell: '#5e5086', Elixir: '#6e4a7e', Clojure: '#db5855', Erlang: '#B83998',
  R: '#198CE7', Julia: '#a270ba', Zig: '#ec915c', Nim: '#ffc200', Crystal: '#000100',
  HTML: '#e34c26', CSS: '#563d7c', SCSS: '#c6538c', Vue: '#41b883', Svelte: '#ff3e00',
  Shell: '#89e051', PowerShell: '#012456', Dockerfile: '#384d54', Makefile: '#427819',
  'Jupyter Notebook': '#DA5B0B', TeX: '#3D6117', Markdown: '#083fa1', Astro: '#ff5a03',
  Solidity: '#AA6746', GDScript: '#355570', 'Vim Script': '#199f4b', Assembly: '#6E4C13',
  Other: '#8b8b9a',
};

// Deterministic fallback for languages not in the map (stable per name).
export function getLangColor(name) {
  if (!name) return LANG_COLORS.Other;
  if (LANG_COLORS[name]) return LANG_COLORS[name];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 55% 58%)`;
}
