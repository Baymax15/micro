function format(ms, str = false) {
  const t = {
    dd : Math.floor(ms / (1000 * 60 * 60 * 24)),
    hh : Math.floor(ms % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
    mm : Math.floor(ms % (1000 * 60 * 60) / (1000 * 60)),
    ss : Math.floor(ms % (1000 * 60) / 1000),
  };
  function s(a) { return a > 1 ? 's' : '';}
  if (str) return `${t.dd ? `${t.dd} day${s(t.dd)} ` : ''}${t.hh ? `${t.hh} hour${s(t.hh)} ` : ''}${t.mm ? `${t.mm} minute${s(t.mm)} ` : ''}${t.ss ? `${t.ss} second${s(t.ss)} ` : ''}`;
  return t;
}
console.log(format(1000021000, true));
