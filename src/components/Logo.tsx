// Drop the official logo into src/assets/ as logo.svg or logo.png (white version, for the navy bar).
// Until then a plain text name is shown. We deliberately do not redraw the brand mark.
const files = import.meta.glob('../assets/logo.{svg,png}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const src = Object.values(files)[0];

export function Logo() {
  return src ? <img src={src} alt="Indegene" /> : <span className="wordmark">Indegene</span>;
}
