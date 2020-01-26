#!/usr/bin/env node
             
const path = require('path');
const fs = require('fs');
const os = require('os');
const _module = require('module');
const stream = require('stream');             
const t = (a, b = 0, e = !1) => {
  if (0 === b && !e) {
    return a;
  }
  a = a.split("\n", e ? b + 1 : void 0);
  return e ? a[a.length - 1] : a.slice(b).join("\n");
}, u = (a, b = !1) => t(a, 2 + (b ? 1 : 0)), v = a => {
  ({callee:{caller:a}} = a);
  return a;
};
const w = os.homedir;
const y = /\s+at.*(?:\(|\s)(.*)\)?/, z = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:IGNORED_MODULES)\/.*)?\w+)\.js:\d+:\d+)|native)/, A = w(), C = a => {
  const {pretty:b = !1, ignoredModules:e = ["pirates"]} = {}, k = e.join("|"), g = new RegExp(z.source.replace("IGNORED_MODULES", k));
  return a.replace(/\\/g, "/").split("\n").filter(d => {
    d = d.match(y);
    if (null === d || !d[1]) {
      return !0;
    }
    d = d[1];
    return d.includes(".app/Contents/Resources/electron.asar") || d.includes(".app/Contents/Resources/default_app.asar") ? !1 : !g.test(d);
  }).filter(d => d.trim()).map(d => b ? d.replace(y, (m, h) => m.replace(h, h.replace(A, "~"))) : d).join("\n");
};
function D(a, b, e = !1) {
  return function(k) {
    var g = v(arguments), {stack:d} = Error();
    const m = t(d, 2, !0), h = (d = k instanceof Error) ? k.message : k;
    g = [`Error: ${h}`, ...null !== g && a === g || e ? [b] : [m, b]].join("\n");
    g = C(g);
    return Object.assign(d ? k : Error(), {message:h, stack:g});
  };
}
;function E(a) {
  var {stack:b} = Error();
  const e = v(arguments);
  b = u(b, a);
  return D(e, b, a);
}
;function G(a, b) {
  if (b > a - 2) {
    throw Error("Function does not accept that many arguments.");
  }
}
async function H(a, b, e) {
  const k = E(!0);
  if ("function" !== typeof a) {
    throw Error("Function must be passed.");
  }
  const g = a.length;
  if (!g) {
    throw Error("Function does not accept any arguments.");
  }
  return await new Promise((d, m) => {
    const h = (c, n) => c ? (c = k(c), m(c)) : d(e || n);
    let l = [h];
    Array.isArray(b) ? (b.forEach((c, n) => {
      G(g, n);
    }), l = [...b, h]) : 1 < Array.from(arguments).length && (G(g, 0), l = [b, h]);
    a(...l);
  });
}
;const I = fs.createReadStream, J = fs.lstat, K = fs.readdir;
const L = async a => {
  try {
    return await H(J, a);
  } catch (b) {
    return null;
  }
};
const M = path.dirname, N = path.join, O = path.relative, P = path.resolve;
const R = async(a, b) => {
  b && (b = M(b), a = N(b, a));
  var e = await L(a);
  b = a;
  let k = !1;
  if (!e) {
    if (b = await Q(a), !b) {
      throw Error(`${a}.js or ${a}.jsx is not found.`);
    }
  } else {
    if (e.isDirectory()) {
      e = !1;
      let g;
      a.endsWith("/") || (g = b = await Q(a), e = !0);
      if (!g) {
        b = await Q(N(a, "index"));
        if (!b) {
          throw Error(`${e ? `${a}.jsx? does not exist, and ` : ""}index.jsx? file is not found in ${a}`);
        }
        k = !0;
      }
    }
  }
  return {path:a.startsWith(".") ? O("", b) : b, i:k};
}, Q = async a => {
  a = `${a}.js`;
  let b = await L(a);
  b || (a = `${a}x`);
  if (b = await L(a)) {
    return a;
  }
};
const S = _module.builtinModules;
const aa = stream.Writable;
const ba = (a, b) => {
  b.once("error", e => {
    a.emit("error", e);
  });
  return b;
};
class ca extends aa {
  constructor(a) {
    const {binary:b = !1, rs:e = null, ...k} = a || {}, {g = E(!0), proxyError:d} = a || {}, m = (h, l) => g(l);
    super(k);
    this.a = [];
    this.b = new Promise((h, l) => {
      this.on("finish", () => {
        let c;
        b ? c = Buffer.concat(this.a) : c = this.a.join("");
        h(c);
        this.a = [];
      });
      this.once("error", c => {
        if (-1 == c.stack.indexOf("\n")) {
          m`${c}`;
        } else {
          const n = C(c.stack);
          c.stack = n;
          d && m`${c}`;
        }
        l(c);
      });
      e && ba(this, e).pipe(this);
    });
  }
  _write(a, b, e) {
    this.a.push(a);
    e();
  }
  get f() {
    return this.b;
  }
}
const da = async a => {
  ({f:a} = new ca({rs:a, g:E(!0)}));
  return await a;
};
async function T(a) {
  a = I(a);
  return await da(a);
}
;function U(a, b) {
  var e = ["q", "from"];
  const k = [];
  b.replace(a, (g, ...d) => {
    g = d.slice(0, d.length - 2).reduce((m, h, l) => {
      l = e[l];
      if (!l || void 0 === h) {
        return m;
      }
      m[l] = h;
      return m;
    }, {});
    k.push(g);
  });
  return k;
}
;const ea = /^ *import(?:\s+(?:[^\s,]+)\s*,?)?(?:\s*{(?:[^}]+)})?\s+from\s+(['"])(.+?)\1/gm, fa = /^ *import\s+(?:.+?\s*,\s*)?\*\s+as\s+.+?\s+from\s+(['"])(.+?)\1/gm, ha = /^ *import\s+(['"])(.+?)\1/gm, ia = /^ *export\s+(?:{[^}]+?}|\*)\s+from\s+(['"])(.+?)\1/gm, ja = a => [ea, fa, ha, ia].reduce((b, e) => {
  e = U(e, a).map(k => k.from);
  return [...b, ...e];
}, []);
const V = async(a, b, e = {}) => {
  const {fields:k, soft:g = !1} = e;
  var d = N(a, "node_modules", b);
  d = N(d, "package.json");
  const m = await L(d);
  if (m) {
    a = await ka(d, k);
    if (void 0 === a) {
      throw Error(`The package ${O("", d)} does export the module.`);
    }
    if (!a.entryExists && !g) {
      throw Error(`The exported module ${a.main} in package ${b} does not exist.`);
    }
    const {entry:h, version:l, packageName:c, main:n, entryExists:p, ...f} = a;
    return {entry:O("", h), packageJson:O("", d), ...l ? {version:l} : {}, packageName:c, ...n ? {hasMain:!0} : {}, ...p ? {} : {entryExists:!1}, ...f};
  }
  if ("/" == a && !m) {
    throw Error(`Package.json for module ${b} not found.`);
  }
  return V(N(P(a), ".."), b, e);
}, ka = async(a, b = []) => {
  const e = await T(a);
  let k, g, d, m, h;
  try {
    ({module:k, version:g, name:d, main:m, ...h} = JSON.parse(e)), h = b.reduce((c, n) => {
      c[n] = h[n];
      return c;
    }, {});
  } catch (c) {
    throw Error(`Could not parse ${a}.`);
  }
  a = M(a);
  b = k || m;
  if (!b) {
    if (!await L(N(a, "index.js"))) {
      return;
    }
    b = m = "index.js";
  }
  a = N(a, b);
  let l;
  try {
    ({path:l} = await R(a)), a = l;
  } catch (c) {
  }
  return {entry:a, version:g, packageName:d, main:!k && m, entryExists:!!l, ...h};
};
const W = a => /^[./]/.test(a), X = async(a, b, e, k, g = null) => {
  const d = E(), m = M(a);
  b = b.map(async h => {
    if (S.includes(h)) {
      return {internal:h};
    }
    if (/^[./]/.test(h)) {
      try {
        var {path:l} = await R(h, a);
        return {entry:l, package:g};
      } catch (c) {
      }
    } else {
      {
        let [p, f, ...q] = h.split("/");
        !p.startsWith("@") && f ? (q = [f, ...q], f = p) : f = p.startsWith("@") ? `${p}/${f}` : p;
        l = {name:f, paths:q.join("/")};
      }
      const {name:c, paths:n} = l;
      if (n) {
        const {packageJson:p, packageName:f} = await V(m, c);
        h = M(p);
        ({path:h} = await R(N(h, n)));
        return {entry:h, package:f};
      }
    }
    try {
      const {entry:c, packageJson:n, version:p, packageName:f, hasMain:q, ...r} = await V(m, h, {fields:k});
      return f == g ? (console.warn("[static-analysis] Skipping package %s that imports itself in %s", f, a), null) : {entry:c, packageJson:n, version:p, name:f, ...q ? {hasMain:q} : {}, ...r};
    } catch (c) {
      if (e) {
        return null;
      }
      throw d(c);
    }
  });
  return (await Promise.all(b)).filter(Boolean);
}, Y = async(a, b = {}, {nodeModules:e = !0, shallow:k = !1, soft:g = !1, fields:d = [], h:m = {}, mergeSameNodeModules:h = !0, package:l} = {}) => {
  if (a in b) {
    return [];
  }
  b[a] = 1;
  var c = await T(a), n = ja(c);
  c = la(c);
  n = e ? n : n.filter(W);
  c = e ? c : c.filter(W);
  try {
    const f = await X(a, n, g, d, l), q = await X(a, c, g, d, l);
    q.forEach(r => {
      r.required = !0;
    });
    var p = [...f, ...q];
  } catch (f) {
    throw f.message = `${a}\n [!] ${f.message}`, f;
  }
  l = h ? p.map(f => {
    var q = f.name, r = f.version;
    const x = f.required;
    if (q && r) {
      q = `${q}:${r}${x ? "-required" : ""}`;
      if (r = m[q]) {
        return r;
      }
      m[q] = f;
    }
    return f;
  }) : p;
  p = l.map(f => ({...f, from:a}));
  return await l.filter(({entry:f}) => f && !(f in b)).reduce(async(f, {entry:q, hasMain:r, packageJson:x, name:F, package:ma}) => {
    if (x && k) {
      return f;
    }
    f = await f;
    F = (await Y(q, b, {nodeModules:e, shallow:k, soft:g, fields:d, package:F || ma, h:m, mergeSameNodeModules:h})).map(B => ({...B, from:B.from ? B.from : q, ...!B.packageJson && r ? {hasMain:r} : {}}));
    return [...f, ...F];
  }, p);
}, la = a => U(/(?:^|[^\w\d_])require\(\s*(['"])(.+?)\1\s*\)/gm, a).map(b => b.from);
/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const na = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90};
async function oa(a, b) {
  b = b.map(async e => {
    const k = N(a, e);
    return {lstat:await H(J, k), path:k, relativePath:e};
  });
  return await Promise.all(b);
}
const pa = a => a.lstat.isDirectory(), qa = a => !a.lstat.isDirectory();
async function Z(a, b = {}) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  const {ignore:e = []} = b;
  if (!(await H(J, a)).isDirectory()) {
    throw b = Error("Path is not a directory"), b.code = "ENOTDIR", b;
  }
  b = await H(K, a);
  var k = await oa(a, b);
  b = k.filter(pa);
  k = k.filter(qa).reduce((g, d) => {
    var m = d.lstat.isDirectory() ? "Directory" : d.lstat.isFile() ? "File" : d.lstat.isSymbolicLink() ? "SymbolicLink" : void 0;
    return {...g, [d.relativePath]:{type:m}};
  }, {});
  b = await b.reduce(async(g, {path:d, relativePath:m}) => {
    const h = O(a, d);
    if (e.includes(h)) {
      return g;
    }
    g = await g;
    d = await Z(d);
    return {...g, [m]:d};
  }, {});
  return {content:{...k, ...b}, type:"Directory"};
}
;module.exports = {c:function(a, b) {
  return (b = na[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}, readDirStructure:Z, staticAnalysis:async(a, b = {}) => {
  const e = E();
  a = Array.isArray(a) ? a : [a];
  a = await Promise.all(a.map(async c => {
    ({path:c} = await R(c));
    return c;
  }));
  const {nodeModules:k = !0, shallow:g = !1, soft:d = !1, fields:m = [], mergeSameNodeModules:h = !0} = b;
  let l;
  try {
    const c = {};
    l = await a.reduce(async(n, p) => {
      n = await n;
      p = await Y(p, c, {nodeModules:k, shallow:g, soft:d, fields:m, mergeSameNodeModules:h});
      n.push(...p);
      return n;
    }, []);
  } catch (c) {
    throw e(c);
  }
  return l.filter(({internal:c, entry:n}, p) => c ? l.findIndex(({internal:f}) => f == c) == p : l.findIndex(({entry:f}) => n == f) == p).map(c => {
    const n = c.entry, p = c.internal, f = l.filter(({internal:q, entry:r}) => {
      if (p) {
        return p == q;
      }
      if (n) {
        return n == r;
      }
    }).map(({from:q}) => q).filter((q, r, x) => x.indexOf(q) == r);
    return {...c, from:f};
  }).map(({package:c, ...n}) => c ? {package:c, ...n} : n);
}};


//# sourceMappingURL=index.js.map