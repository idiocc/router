#!/usr/bin/env node
             
const fs = require('fs');
const path = require('path');
const os = require('os');             
/*
 diff package https://github.com/kpdecker/jsdiff
 BSD License
 Copyright (c) 2009-2015, Kevin Decker <kpdecker@gmail.com>
*/
const l = {black:30, red:31, green:32, yellow:33, blue:34, magenta:35, cyan:36, white:37, grey:90};
const m = fs.lstat, n = fs.readdir;
const p = (a, b = 0, e = !1) => {
  if (0 === b && !e) {
    return a;
  }
  a = a.split("\n", e ? b + 1 : void 0);
  return e ? a[a.length - 1] : a.slice(b).join("\n");
}, q = (a, b = !1) => p(a, 2 + (b ? 1 : 0)), r = a => {
  ({callee:{caller:a}} = a);
  return a;
};
const t = os.homedir;
const u = /\s+at.*(?:\(|\s)(.*)\)?/, v = /^(?:(?:(?:node|(?:internal\/[\w/]*|.*node_modules\/(?:IGNORED_MODULES)\/.*)?\w+)\.js:\d+:\d+)|native)/, w = t(), x = a => {
  const {pretty:b = !1, ignoredModules:e = ["pirates"]} = {}, f = e.join("|"), d = new RegExp(v.source.replace("IGNORED_MODULES", f));
  return a.replace(/\\/g, "/").split("\n").filter(c => {
    c = c.match(u);
    if (null === c || !c[1]) {
      return !0;
    }
    c = c[1];
    return c.includes(".app/Contents/Resources/electron.asar") || c.includes(".app/Contents/Resources/default_app.asar") ? !1 : !d.test(c);
  }).filter(c => c.trim()).map(c => b ? c.replace(u, (g, h) => g.replace(h, h.replace(w, "~"))) : c).join("\n");
};
function y(a, b, e = !1) {
  return function(f) {
    var d = r(arguments), {stack:c} = Error();
    const g = p(c, 2, !0), h = (c = f instanceof Error) ? f.message : f;
    d = [`Error: ${h}`, ...null !== d && a === d || e ? [b] : [g, b]].join("\n");
    d = x(d);
    return Object.assign(c ? f : Error(), {message:h, stack:d});
  };
}
;function z(a) {
  var {stack:b} = Error();
  const e = r(arguments);
  b = q(b, a);
  return y(e, b, a);
}
;async function A(a, b, e) {
  const f = z(!0);
  if ("function" != typeof a) {
    throw Error("Function must be passed.");
  }
  if (!a.length) {
    throw Error(`Function${a.name ? ` ${a.name}` : ""} does not accept any arguments.`);
  }
  return await new Promise((d, c) => {
    const g = (k, C) => k ? (k = f(k), c(k)) : d(e || C);
    let h = [g];
    Array.isArray(b) ? h = [...b, g] : 1 < Array.from(arguments).length && (h = [b, g]);
    a(...h);
  });
}
;const B = path.join, D = path.relative;
async function E(a, b) {
  b = b.map(async e => {
    const f = B(a, e);
    return {lstat:await A(m, f), path:f, relativePath:e};
  });
  return await Promise.all(b);
}
const F = a => a.lstat.isDirectory(), G = a => !a.lstat.isDirectory();
async function H(a, b = {}) {
  if (!a) {
    throw Error("Please specify a path to the directory");
  }
  const {ignore:e = []} = b;
  if (!(await A(m, a)).isDirectory()) {
    throw b = Error("Path is not a directory"), b.code = "ENOTDIR", b;
  }
  b = await A(n, a);
  var f = await E(a, b);
  b = f.filter(F);
  f = f.filter(G).reduce((d, c) => {
    var g = c.lstat.isDirectory() ? "Directory" : c.lstat.isFile() ? "File" : c.lstat.isSymbolicLink() ? "SymbolicLink" : void 0;
    return {...d, [c.relativePath]:{type:g}};
  }, {});
  b = await b.reduce(async(d, {path:c, relativePath:g}) => {
    const h = D(a, c);
    if (e.includes(h)) {
      return d;
    }
    d = await d;
    c = await H(c);
    return {...d, [g]:c};
  }, {});
  return {content:{...f, ...b}, type:"Directory"};
}
;module.exports = {c:function(a, b) {
  return (b = l[b]) ? `\x1b[${b}m${a}\x1b[0m` : a;
}, readDirStructure:H};


//# sourceMappingURL=index.js.map