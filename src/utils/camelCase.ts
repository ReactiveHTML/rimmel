export const camelCase = (s: string) =>
    s.split('-').map((s, i) => i ? s[0].toLocaleUpperCase() + s.slice(1) : s).join('')
;
