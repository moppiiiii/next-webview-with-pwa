(() => {
  let e, t, a;
  const s = (e, ...t) => {
    let a = e;
    return t.length > 0 && (a += ` :: ${JSON.stringify(t)}`), a;
  };
  class r extends Error {
    details;
    constructor(e, t) {
      super(s(e, t)), (this.name = e), (this.details = t);
    }
  }
  const n = (e) =>
      new URL(String(e), location.href).href.replace(
        RegExp(`^${location.origin}`),
        "",
      ),
    i = {
      googleAnalytics: "googleAnalytics",
      precache: "precache-v2",
      prefix: "serwist",
      runtime: "runtime",
      suffix: "undefined" != typeof registration ? registration.scope : "",
    },
    c = (e) =>
      [i.prefix, e, i.suffix].filter((e) => e && e.length > 0).join("-"),
    o = (e) => {
      for (const t of Object.keys(i)) e(t);
    },
    l = {
      updateDetails: (e) => {
        o((t) => {
          const a = e[t];
          "string" == typeof a && (i[t] = a);
        });
      },
      getGoogleAnalyticsName: (e) => e || c(i.googleAnalytics),
      getPrecacheName: (e) => e || c(i.precache),
      getRuntimeName: (e) => e || c(i.runtime),
    };
  class h {
    promise;
    resolve;
    reject;
    constructor() {
      this.promise = new Promise((e, t) => {
        (this.resolve = e), (this.reject = t);
      });
    }
  }
  function u(e, t) {
    const a = new URL(e);
    for (const e of t) a.searchParams.delete(e);
    return a.href;
  }
  async function d(e, t, a, s) {
    const r = u(t.url, a);
    if (t.url === r) return e.match(t, s);
    const n = { ...s, ignoreSearch: !0 };
    for (const i of await e.keys(t, n))
      if (r === u(i.url, a)) return e.match(i, s);
  }
  const m = new Set(),
    f = async () => {
      for (const e of m) await e();
    };
  function g(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  let p = "-precache-",
    w = async (e, t = p) => {
      const a = (await self.caches.keys()).filter(
        (a) => a.includes(t) && a.includes(self.registration.scope) && a !== e,
      );
      return await Promise.all(a.map((e) => self.caches.delete(e))), a;
    },
    y = (e) => {
      self.addEventListener("activate", (t) => {
        t.waitUntil(w(l.getPrecacheName(e)).then((e) => {}));
      });
    },
    _ = () => {
      self.addEventListener("activate", () => self.clients.claim());
    },
    b = (e, t) => {
      const a = t();
      return e.waitUntil(a), a;
    },
    x = (e, t) => t.some((t) => e instanceof t),
    E = new WeakMap(),
    v = new WeakMap(),
    R = new WeakMap(),
    q = {
      get(e, t, a) {
        if (e instanceof IDBTransaction) {
          if ("done" === t) return E.get(e);
          if ("store" === t)
            return a.objectStoreNames[1]
              ? void 0
              : a.objectStore(a.objectStoreNames[0]);
        }
        return S(e[t]);
      },
      set: (e, t, a) => ((e[t] = a), !0),
      has: (e, t) =>
        (e instanceof IDBTransaction && ("done" === t || "store" === t)) ||
        t in e,
    };
  function S(e) {
    var s;
    if (e instanceof IDBRequest)
      return ((e) => {
        const t = new Promise((t, a) => {
          const s = () => {
              e.removeEventListener("success", r),
                e.removeEventListener("error", n);
            },
            r = () => {
              t(S(e.result)), s();
            },
            n = () => {
              a(e.error), s();
            };
          e.addEventListener("success", r), e.addEventListener("error", n);
        });
        return R.set(t, e), t;
      })(e);
    if (v.has(e)) return v.get(e);
    const r =
      "function" == typeof (s = e)
        ? (
            a ||
            (a = [
              IDBCursor.prototype.advance,
              IDBCursor.prototype.continue,
              IDBCursor.prototype.continuePrimaryKey,
            ])
          ).includes(s)
          ? function (...e) {
              return s.apply(D(this), e), S(this.request);
            }
          : function (...e) {
              return S(s.apply(D(this), e));
            }
        : (s instanceof IDBTransaction &&
              ((e) => {
                if (E.has(e)) return;
                const t = new Promise((t, a) => {
                  const s = () => {
                      e.removeEventListener("complete", r),
                        e.removeEventListener("error", n),
                        e.removeEventListener("abort", n);
                    },
                    r = () => {
                      t(), s();
                    },
                    n = () => {
                      a(
                        e.error || new DOMException("AbortError", "AbortError"),
                      ),
                        s();
                    };
                  e.addEventListener("complete", r),
                    e.addEventListener("error", n),
                    e.addEventListener("abort", n);
                });
                E.set(e, t);
              })(s),
            x(
              s,
              t ||
                (t = [
                  IDBDatabase,
                  IDBObjectStore,
                  IDBIndex,
                  IDBCursor,
                  IDBTransaction,
                ]),
            ))
          ? new Proxy(s, q)
          : s;
    return r !== e && (v.set(e, r), R.set(r, e)), r;
  }
  const D = (e) => R.get(e);
  function N(
    e,
    t,
    { blocked: a, upgrade: s, blocking: r, terminated: n } = {},
  ) {
    const i = indexedDB.open(e, t),
      c = S(i);
    return (
      s &&
        i.addEventListener("upgradeneeded", (e) => {
          s(S(i.result), e.oldVersion, e.newVersion, S(i.transaction), e);
        }),
      a &&
        i.addEventListener("blocked", (e) => a(e.oldVersion, e.newVersion, e)),
      c
        .then((e) => {
          n && e.addEventListener("close", () => n()),
            r &&
              e.addEventListener("versionchange", (e) =>
                r(e.oldVersion, e.newVersion, e),
              );
        })
        .catch(() => {}),
      c
    );
  }
  const P = ["get", "getKey", "getAll", "getAllKeys", "count"],
    C = ["put", "add", "delete", "clear"],
    T = new Map();
  function A(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && "string" == typeof t))
      return;
    if (T.get(t)) return T.get(t);
    const a = t.replace(/FromIndex$/, ""),
      s = t !== a,
      r = C.includes(a);
    if (
      !(a in (s ? IDBIndex : IDBObjectStore).prototype) ||
      !(r || P.includes(a))
    )
      return;
    const n = async function (e, ...t) {
      let n = this.transaction(e, r ? "readwrite" : "readonly"),
        i = n.store;
      return (
        s && (i = i.index(t.shift())),
        (await Promise.all([i[a](...t), r && n.done]))[0]
      );
    };
    return T.set(t, n), n;
  }
  q = ((e) => ({
    ...e,
    get: (t, a, s) => A(t, a) || e.get(t, a, s),
    has: (t, a) => !!A(t, a) || e.has(t, a),
  }))(q);
  const k = ["continue", "continuePrimaryKey", "advance"],
    I = {},
    U = new WeakMap(),
    L = new WeakMap(),
    F = {
      get(e, t) {
        if (!k.includes(t)) return e[t];
        let a = I[t];
        return (
          a ||
            (a = I[t] =
              function (...e) {
                U.set(this, L.get(this)[t](...e));
              }),
          a
        );
      },
    };
  async function* O(...e) {
    let t = this;
    if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return;
    const a = new Proxy(t, F);
    for (L.set(a, t), R.set(a, D(t)); t; )
      yield a, (t = await (U.get(a) || t.continue())), U.delete(a);
  }
  function M(e, t) {
    return (
      (t === Symbol.asyncIterator &&
        x(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
      ("iterate" === t && x(e, [IDBIndex, IDBObjectStore]))
    );
  }
  q = ((e) => ({
    ...e,
    get: (t, a, s) => (M(t, a) ? O : e.get(t, a, s)),
    has: (t, a) => M(t, a) || e.has(t, a),
  }))(q);
  const B = (e) => (e && "object" == typeof e ? e : { handle: e });
  class K {
    handler;
    match;
    method;
    catchHandler;
    constructor(e, t, a = "GET") {
      (this.handler = B(t)), (this.match = e), (this.method = a);
    }
    setCatchHandler(e) {
      this.catchHandler = B(e);
    }
  }
  class W extends K {
    _allowlist;
    _denylist;
    constructor(e, { allowlist: t = [/./], denylist: a = [] } = {}) {
      super((e) => this._match(e), e),
        (this._allowlist = t),
        (this._denylist = a);
    }
    _match({ url: e, request: t }) {
      if (t && "navigate" !== t.mode) return !1;
      const a = e.pathname + e.search;
      for (const e of this._denylist) if (e.test(a)) return !1;
      return !!this._allowlist.some((e) => e.test(a));
    }
  }
  const j = (e, t = []) => {
    for (const a of [...e.searchParams.keys()])
      t.some((e) => e.test(a)) && e.searchParams.delete(a);
    return e;
  };
  class $ extends K {
    constructor(e, t, a) {
      super(
        ({ url: t }) => {
          const a = e.exec(t.href);
          if (a && (t.origin === location.origin || 0 === a.index))
            return a.slice(1);
        },
        t,
        a,
      );
    }
  }
  const H = async (e, t, a) => {
      const s = t.map((e, t) => ({ index: t, item: e })),
        r = async (e) => {
          const t = [];
          for (;;) {
            const r = s.pop();
            if (!r) return e(t);
            const n = await a(r.item);
            t.push({ result: n, index: r.index });
          }
        },
        n = Array.from({ length: e }, () => new Promise(r));
      return (await Promise.all(n))
        .flat()
        .sort((e, t) => (e.index < t.index ? -1 : 1))
        .map((e) => e.result);
    },
    G = () => {
      self.__WB_DISABLE_DEV_LOGS = !0;
    };
  function V(e) {
    return "string" == typeof e ? new Request(e) : e;
  }
  class Q {
    event;
    request;
    url;
    params;
    _cacheKeys = {};
    _strategy;
    _handlerDeferred;
    _extendLifetimePromises;
    _plugins;
    _pluginStateMap;
    constructor(e, t) {
      for (const a of ((this.event = t.event),
      (this.request = t.request),
      t.url && ((this.url = t.url), (this.params = t.params)),
      (this._strategy = e),
      (this._handlerDeferred = new h()),
      (this._extendLifetimePromises = []),
      (this._plugins = [...e.plugins]),
      (this._pluginStateMap = new Map()),
      this._plugins))
        this._pluginStateMap.set(a, {});
      this.event.waitUntil(this._handlerDeferred.promise);
    }
    async fetch(e) {
      let { event: t } = this,
        a = V(e),
        s = await this.getPreloadResponse();
      if (s) return s;
      const n = this.hasCallback("fetchDidFail") ? a.clone() : null;
      try {
        for (const e of this.iterateCallbacks("requestWillFetch"))
          a = await e({ request: a.clone(), event: t });
      } catch (e) {
        if (e instanceof Error)
          throw new r("plugin-error-request-will-fetch", {
            thrownErrorMessage: e.message,
          });
      }
      const i = a.clone();
      try {
        let e;
        for (const s of ((e = await fetch(
          a,
          "navigate" === a.mode ? void 0 : this._strategy.fetchOptions,
        )),
        this.iterateCallbacks("fetchDidSucceed")))
          e = await s({ event: t, request: i, response: e });
        return e;
      } catch (e) {
        throw (
          (n &&
            (await this.runCallbacks("fetchDidFail", {
              error: e,
              event: t,
              originalRequest: n.clone(),
              request: i.clone(),
            })),
          e)
        );
      }
    }
    async fetchAndCachePut(e) {
      const t = await this.fetch(e),
        a = t.clone();
      return this.waitUntil(this.cachePut(e, a)), t;
    }
    async cacheMatch(e) {
      let t;
      const a = V(e),
        { cacheName: s, matchOptions: r } = this._strategy,
        n = await this.getCacheKey(a, "read"),
        i = { ...r, cacheName: s };
      for (const e of ((t = await caches.match(n, i)),
      this.iterateCallbacks("cachedResponseWillBeUsed")))
        t =
          (await e({
            cacheName: s,
            matchOptions: r,
            cachedResponse: t,
            request: n,
            event: this.event,
          })) || void 0;
      return t;
    }
    async cachePut(e, t) {
      const a = V(e);
      await g(0);
      const s = await this.getCacheKey(a, "write");
      if (!t) throw new r("cache-put-with-no-response", { url: n(s.url) });
      const i = await this._ensureResponseSafeToCache(t);
      if (!i) return !1;
      const { cacheName: c, matchOptions: o } = this._strategy,
        l = await self.caches.open(c),
        h = this.hasCallback("cacheDidUpdate"),
        u = h ? await d(l, s.clone(), ["__WB_REVISION__"], o) : null;
      try {
        await l.put(s, h ? i.clone() : i);
      } catch (e) {
        if (e instanceof Error)
          throw ("QuotaExceededError" === e.name && (await f()), e);
      }
      for (const e of this.iterateCallbacks("cacheDidUpdate"))
        await e({
          cacheName: c,
          oldResponse: u,
          newResponse: i.clone(),
          request: s,
          event: this.event,
        });
      return !0;
    }
    async getCacheKey(e, t) {
      const a = `${e.url} | ${t}`;
      if (!this._cacheKeys[a]) {
        let s = e;
        for (const e of this.iterateCallbacks("cacheKeyWillBeUsed"))
          s = V(
            await e({
              mode: t,
              request: s,
              event: this.event,
              params: this.params,
            }),
          );
        this._cacheKeys[a] = s;
      }
      return this._cacheKeys[a];
    }
    hasCallback(e) {
      for (const t of this._strategy.plugins) if (e in t) return !0;
      return !1;
    }
    async runCallbacks(e, t) {
      for (const a of this.iterateCallbacks(e)) await a(t);
    }
    *iterateCallbacks(e) {
      for (const t of this._strategy.plugins)
        if ("function" == typeof t[e]) {
          const a = this._pluginStateMap.get(t),
            s = (s) => {
              const r = { ...s, state: a };
              return t[e](r);
            };
          yield s;
        }
    }
    waitUntil(e) {
      return this._extendLifetimePromises.push(e), e;
    }
    async doneWaiting() {
      let e;
      while ((e = this._extendLifetimePromises.shift())) await e;
    }
    destroy() {
      this._handlerDeferred.resolve(null);
    }
    async getPreloadResponse() {
      if (
        this.event instanceof FetchEvent &&
        "navigate" === this.event.request.mode &&
        "preloadResponse" in this.event
      )
        try {
          const e = await this.event.preloadResponse;
          if (e) return e;
        } catch (e) {}
    }
    async _ensureResponseSafeToCache(e) {
      let t = e,
        a = !1;
      for (const e of this.iterateCallbacks("cacheWillUpdate"))
        if (
          ((t =
            (await e({
              request: this.request,
              response: t,
              event: this.event,
            })) || void 0),
          (a = !0),
          !t)
        )
          break;
      return !a && t && 200 !== t.status && (t = void 0), t;
    }
  }
  class z {
    cacheName;
    plugins;
    fetchOptions;
    matchOptions;
    constructor(e = {}) {
      (this.cacheName = l.getRuntimeName(e.cacheName)),
        (this.plugins = e.plugins || []),
        (this.fetchOptions = e.fetchOptions),
        (this.matchOptions = e.matchOptions);
    }
    handle(e) {
      const [t] = this.handleAll(e);
      return t;
    }
    handleAll(e) {
      e instanceof FetchEvent && (e = { event: e, request: e.request });
      const t = e.event,
        a = "string" == typeof e.request ? new Request(e.request) : e.request,
        s = new Q(
          this,
          e.url
            ? { event: t, request: a, url: e.url, params: e.params }
            : { event: t, request: a },
        ),
        r = this._getResponse(s, a, t),
        n = this._awaitComplete(r, s, a, t);
      return [r, n];
    }
    async _getResponse(e, t, a) {
      let s;
      await e.runCallbacks("handlerWillStart", { event: a, request: t });
      try {
        if (
          ((s = await this._handle(t, e)), void 0 === s || "error" === s.type)
        )
          throw new r("no-response", { url: t.url });
      } catch (r) {
        if (r instanceof Error) {
          for (const n of e.iterateCallbacks("handlerDidError"))
            if (void 0 !== (s = await n({ error: r, event: a, request: t })))
              break;
        }
        if (!s) throw r;
      }
      for (const r of e.iterateCallbacks("handlerWillRespond"))
        s = await r({ event: a, request: t, response: s });
      return s;
    }
    async _awaitComplete(e, t, a, s) {
      let r, n;
      try {
        r = await e;
      } catch (e) {}
      try {
        await t.runCallbacks("handlerDidRespond", {
          event: s,
          request: a,
          response: r,
        }),
          await t.doneWaiting();
      } catch (e) {
        e instanceof Error && (n = e);
      }
      if (
        (await t.runCallbacks("handlerDidComplete", {
          event: s,
          request: a,
          response: r,
          error: n,
        }),
        t.destroy(),
        n)
      )
        throw n;
    }
  }
  const J = {
    cacheWillUpdate: async ({ response: e }) =>
      200 === e.status || 0 === e.status ? e : null,
  };
  class Y extends z {
    _networkTimeoutSeconds;
    constructor(e = {}) {
      super(e),
        this.plugins.some((e) => "cacheWillUpdate" in e) ||
          this.plugins.unshift(J),
        (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0);
    }
    async _handle(e, t) {
      let a;
      const s = [],
        n = [];
      if (this._networkTimeoutSeconds) {
        const { id: r, promise: i } = this._getTimeoutPromise({
          request: e,
          logs: s,
          handler: t,
        });
        (a = r), n.push(i);
      }
      const i = this._getNetworkPromise({
        timeoutId: a,
        request: e,
        logs: s,
        handler: t,
      });
      n.push(i);
      const c = await t.waitUntil(
        (async () => (await t.waitUntil(Promise.race(n))) || (await i))(),
      );
      if (!c) throw new r("no-response", { url: e.url });
      return c;
    }
    _getTimeoutPromise({ request: e, logs: t, handler: a }) {
      let s;
      return {
        promise: new Promise((t) => {
          s = setTimeout(async () => {
            t(await a.cacheMatch(e));
          }, 1e3 * this._networkTimeoutSeconds);
        }),
        id: s,
      };
    }
    async _getNetworkPromise({
      timeoutId: e,
      request: t,
      logs: a,
      handler: s,
    }) {
      let r, n;
      try {
        n = await s.fetchAndCachePut(t);
      } catch (e) {
        e instanceof Error && (r = e);
      }
      return e && clearTimeout(e), (r || !n) && (n = await s.cacheMatch(t)), n;
    }
  }
  class X extends z {
    _networkTimeoutSeconds;
    constructor(e = {}) {
      super(e), (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0);
    }
    async _handle(e, t) {
      let a, s;
      try {
        const s = [t.fetch(e)];
        if (this._networkTimeoutSeconds) {
          const e = g(1e3 * this._networkTimeoutSeconds);
          s.push(e);
        }
        if (!(a = await Promise.race(s)))
          throw Error(
            `Timed out the network response after ${this._networkTimeoutSeconds} seconds.`,
          );
      } catch (e) {
        e instanceof Error && (s = e);
      }
      if (!a) throw new r("no-response", { url: e.url, error: s });
      return a;
    }
  }
  const Z = "requests",
    ee = "queueName";
  class et {
    _db = null;
    async addEntry(e) {
      const t = (await this.getDb()).transaction(Z, "readwrite", {
        durability: "relaxed",
      });
      await t.store.add(e), await t.done;
    }
    async getFirstEntryId() {
      const e = await this.getDb(),
        t = await e.transaction(Z).store.openCursor();
      return t?.value.id;
    }
    async getAllEntriesByQueueName(e) {
      const t = await this.getDb();
      return (await t.getAllFromIndex(Z, ee, IDBKeyRange.only(e))) || [];
    }
    async getEntryCountByQueueName(e) {
      return (await this.getDb()).countFromIndex(Z, ee, IDBKeyRange.only(e));
    }
    async deleteEntry(e) {
      const t = await this.getDb();
      await t.delete(Z, e);
    }
    async getFirstEntryByQueueName(e) {
      return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "next");
    }
    async getLastEntryByQueueName(e) {
      return await this.getEndEntryFromIndex(IDBKeyRange.only(e), "prev");
    }
    async getEndEntryFromIndex(e, t) {
      const a = await this.getDb(),
        s = await a.transaction(Z).store.index(ee).openCursor(e, t);
      return s?.value;
    }
    async getDb() {
      return (
        this._db ||
          (this._db = await N("serwist-background-sync", 3, {
            upgrade: this._upgradeDb,
          })),
        this._db
      );
    }
    _upgradeDb(e, t) {
      t > 0 &&
        t < 3 &&
        e.objectStoreNames.contains(Z) &&
        e.deleteObjectStore(Z),
        e
          .createObjectStore(Z, { autoIncrement: !0, keyPath: "id" })
          .createIndex(ee, ee, { unique: !1 });
    }
  }
  class ea {
    _queueName;
    _queueDb;
    constructor(e) {
      (this._queueName = e), (this._queueDb = new et());
    }
    async pushEntry(e) {
      delete e.id,
        (e.queueName = this._queueName),
        await this._queueDb.addEntry(e);
    }
    async unshiftEntry(e) {
      const t = await this._queueDb.getFirstEntryId();
      t ? (e.id = t - 1) : delete e.id,
        (e.queueName = this._queueName),
        await this._queueDb.addEntry(e);
    }
    async popEntry() {
      return this._removeEntry(
        await this._queueDb.getLastEntryByQueueName(this._queueName),
      );
    }
    async shiftEntry() {
      return this._removeEntry(
        await this._queueDb.getFirstEntryByQueueName(this._queueName),
      );
    }
    async getAll() {
      return await this._queueDb.getAllEntriesByQueueName(this._queueName);
    }
    async size() {
      return await this._queueDb.getEntryCountByQueueName(this._queueName);
    }
    async deleteEntry(e) {
      await this._queueDb.deleteEntry(e);
    }
    async _removeEntry(e) {
      return e && (await this.deleteEntry(e.id)), e;
    }
  }
  const es = [
    "method",
    "referrer",
    "referrerPolicy",
    "mode",
    "credentials",
    "cache",
    "redirect",
    "integrity",
    "keepalive",
  ];
  class er {
    _requestData;
    static async fromRequest(e) {
      const t = { url: e.url, headers: {} };
      for (const a of ("GET" !== e.method &&
        (t.body = await e.clone().arrayBuffer()),
      e.headers.forEach((e, a) => {
        t.headers[a] = e;
      }),
      es))
        void 0 !== e[a] && (t[a] = e[a]);
      return new er(t);
    }
    constructor(e) {
      "navigate" === e.mode && (e.mode = "same-origin"),
        (this._requestData = e);
    }
    toObject() {
      const e = Object.assign({}, this._requestData);
      return (
        (e.headers = Object.assign({}, this._requestData.headers)),
        e.body && (e.body = e.body.slice(0)),
        e
      );
    }
    toRequest() {
      return new Request(this._requestData.url, this._requestData);
    }
    clone() {
      return new er(this.toObject());
    }
  }
  const en = "serwist-background-sync",
    ei = new Set(),
    ec = (e) => {
      const t = {
        request: new er(e.requestData).toRequest(),
        timestamp: e.timestamp,
      };
      return e.metadata && (t.metadata = e.metadata), t;
    };
  class eo {
    _name;
    _onSync;
    _maxRetentionTime;
    _queueStore;
    _forceSyncFallback;
    _syncInProgress = !1;
    _requestsAddedDuringSync = !1;
    constructor(
      e,
      { forceSyncFallback: t, onSync: a, maxRetentionTime: s } = {},
    ) {
      if (ei.has(e)) throw new r("duplicate-queue-name", { name: e });
      ei.add(e),
        (this._name = e),
        (this._onSync = a || this.replayRequests),
        (this._maxRetentionTime = s || 10080),
        (this._forceSyncFallback = !!t),
        (this._queueStore = new ea(this._name)),
        this._addSyncListener();
    }
    get name() {
      return this._name;
    }
    async pushRequest(e) {
      await this._addRequest(e, "push");
    }
    async unshiftRequest(e) {
      await this._addRequest(e, "unshift");
    }
    async popRequest() {
      return this._removeRequest("pop");
    }
    async shiftRequest() {
      return this._removeRequest("shift");
    }
    async getAll() {
      const e = await this._queueStore.getAll(),
        t = Date.now(),
        a = [];
      for (const s of e) {
        const e = 6e4 * this._maxRetentionTime;
        t - s.timestamp > e
          ? await this._queueStore.deleteEntry(s.id)
          : a.push(ec(s));
      }
      return a;
    }
    async size() {
      return await this._queueStore.size();
    }
    async _addRequest(
      { request: e, metadata: t, timestamp: a = Date.now() },
      s,
    ) {
      const r = {
        requestData: (await er.fromRequest(e.clone())).toObject(),
        timestamp: a,
      };
      switch ((t && (r.metadata = t), s)) {
        case "push":
          await this._queueStore.pushEntry(r);
          break;
        case "unshift":
          await this._queueStore.unshiftEntry(r);
      }
      this._syncInProgress
        ? (this._requestsAddedDuringSync = !0)
        : await this.registerSync();
    }
    async _removeRequest(e) {
      let t;
      const a = Date.now();
      switch (e) {
        case "pop":
          t = await this._queueStore.popEntry();
          break;
        case "shift":
          t = await this._queueStore.shiftEntry();
      }
      if (t) {
        const s = 6e4 * this._maxRetentionTime;
        return a - t.timestamp > s ? this._removeRequest(e) : ec(t);
      }
    }
    async replayRequests() {
      let e;
      while ((e = await this.shiftRequest()))
        try {
          await fetch(e.request.clone());
        } catch (t) {
          throw (
            (await this.unshiftRequest(e),
            new r("queue-replay-failed", { name: this._name }))
          );
        }
    }
    async registerSync() {
      if ("sync" in self.registration && !this._forceSyncFallback)
        try {
          await self.registration.sync.register(`${en}:${this._name}`);
        } catch (e) {}
    }
    _addSyncListener() {
      "sync" in self.registration && !this._forceSyncFallback
        ? self.addEventListener("sync", (e) => {
            if (e.tag === `${en}:${this._name}`) {
              const t = async () => {
                let t;
                this._syncInProgress = !0;
                try {
                  await this._onSync({ queue: this });
                } catch (e) {
                  if (e instanceof Error) throw e;
                } finally {
                  this._requestsAddedDuringSync &&
                    !(t && !e.lastChance) &&
                    (await this.registerSync()),
                    (this._syncInProgress = !1),
                    (this._requestsAddedDuringSync = !1);
                }
              };
              e.waitUntil(t());
            }
          })
        : this._onSync({ queue: this });
    }
    static get _queueNames() {
      return ei;
    }
  }
  class el {
    _queue;
    constructor(e, t) {
      this._queue = new eo(e, t);
    }
    async fetchDidFail({ request: e }) {
      await this._queue.pushRequest({ request: e });
    }
  }
  const eh = async (t, a) => {
    let s = null;
    if ((t.url && (s = new URL(t.url).origin), s !== self.location.origin))
      throw new r("cross-origin-copy-response", { origin: s });
    const n = t.clone(),
      i = {
        headers: new Headers(n.headers),
        status: n.status,
        statusText: n.statusText,
      },
      c = a ? a(i) : i,
      o = !(() => {
        if (void 0 === e) {
          const t = new Response("");
          if ("body" in t)
            try {
              new Response(t.body), (e = !0);
            } catch (t) {
              e = !1;
            }
          e = !1;
        }
        return e;
      })()
        ? await n.blob()
        : n.body;
    return new Response(o, c);
  };
  class eu extends z {
    _fallbackToNetwork;
    static defaultPrecacheCacheabilityPlugin = {
      cacheWillUpdate: async ({ response: e }) =>
        !e || e.status >= 400 ? null : e,
    };
    static copyRedirectedCacheableResponsesPlugin = {
      cacheWillUpdate: async ({ response: e }) =>
        e.redirected ? await eh(e) : e,
    };
    constructor(e = {}) {
      (e.cacheName = l.getPrecacheName(e.cacheName)),
        super(e),
        (this._fallbackToNetwork = !1 !== e.fallbackToNetwork),
        this.plugins.push(eu.copyRedirectedCacheableResponsesPlugin);
    }
    async _handle(e, t) {
      const a = await t.getPreloadResponse();
      return a
        ? a
        : (await t.cacheMatch(e)) ||
            (t.event && "install" === t.event.type
              ? await this._handleInstall(e, t)
              : await this._handleFetch(e, t));
    }
    async _handleFetch(e, t) {
      let a;
      const s = t.params || {};
      if (this._fallbackToNetwork) {
        const r = s.integrity,
          n = e.integrity,
          i = !n || n === r;
        (a = await t.fetch(
          new Request(e, { integrity: "no-cors" !== e.mode ? n || r : void 0 }),
        )),
          r &&
            i &&
            "no-cors" !== e.mode &&
            (this._useDefaultCacheabilityPluginIfNeeded(),
            await t.cachePut(e, a.clone()));
      } else
        throw new r("missing-precache-entry", {
          cacheName: this.cacheName,
          url: e.url,
        });
      return a;
    }
    async _handleInstall(e, t) {
      this._useDefaultCacheabilityPluginIfNeeded();
      const a = await t.fetch(e);
      if (!(await t.cachePut(e, a.clone())))
        throw new r("bad-precaching-response", {
          url: e.url,
          status: a.status,
        });
      return a;
    }
    _useDefaultCacheabilityPluginIfNeeded() {
      let e = null,
        t = 0;
      for (const [a, s] of this.plugins.entries())
        s !== eu.copyRedirectedCacheableResponsesPlugin &&
          (s === eu.defaultPrecacheCacheabilityPlugin && (e = a),
          s.cacheWillUpdate && t++);
      0 === t
        ? this.plugins.push(eu.defaultPrecacheCacheabilityPlugin)
        : t > 1 && null !== e && this.plugins.splice(e, 1);
    }
  }
  const ed = () => !!self.registration?.navigationPreload,
    em = (e) => {
      ed() &&
        self.addEventListener("activate", (t) => {
          t.waitUntil(
            self.registration.navigationPreload.enable().then(() => {
              e && self.registration.navigationPreload.setHeaderValue(e);
            }),
          );
        });
    },
    ef = (e) => {
      l.updateDetails(e);
    };
  class eg {
    updatedURLs = [];
    notUpdatedURLs = [];
    handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    };
    cachedResponseWillBeUsed = async ({
      event: e,
      state: t,
      cachedResponse: a,
    }) => {
      if (
        "install" === e.type &&
        t?.originalRequest &&
        t.originalRequest instanceof Request
      ) {
        const e = t.originalRequest.url;
        a ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e);
      }
      return a;
    };
  }
  const ep = (e) => {
      if (!e) throw new r("add-to-cache-list-unexpected-type", { entry: e });
      if ("string" == typeof e) {
        const t = new URL(e, location.href);
        return { cacheKey: t.href, url: t.href };
      }
      const { revision: t, url: a } = e;
      if (!a) throw new r("add-to-cache-list-unexpected-type", { entry: e });
      if (!t) {
        const e = new URL(a, location.href);
        return { cacheKey: e.href, url: e.href };
      }
      const s = new URL(a, location.href),
        n = new URL(a, location.href);
      return (
        s.searchParams.set("__WB_REVISION__", t),
        { cacheKey: s.href, url: n.href }
      );
    },
    ew = (e, t, a) => {
      if ("string" == typeof e) {
        const s = new URL(e, location.href);
        return new K(({ url: e }) => e.href === s.href, t, a);
      }
      if (e instanceof RegExp) return new $(e, t, a);
      if ("function" == typeof e) return new K(e, t, a);
      if (e instanceof K) return e;
      throw new r("unsupported-route-type", {
        moduleName: "serwist",
        funcName: "parseRoute",
        paramName: "capture",
      });
    };
  class ey extends K {
    constructor(e, t) {
      super(({ request: a }) => {
        const s = e.getUrlsToPrecacheKeys();
        for (const r of (function* (
          e,
          {
            directoryIndex: t = "index.html",
            ignoreURLParametersMatching: a = [/^utm_/, /^fbclid$/],
            cleanURLs: s = !0,
            urlManipulation: r,
          } = {},
        ) {
          const n = new URL(e, location.href);
          (n.hash = ""), yield n.href;
          const i = j(n, a);
          if ((yield i.href, t && i.pathname.endsWith("/"))) {
            const e = new URL(i.href);
            (e.pathname += t), yield e.href;
          }
          if (s) {
            const e = new URL(i.href);
            (e.pathname += ".html"), yield e.href;
          }
          if (r) for (const e of r({ url: n })) yield e.href;
        })(a.url, t)) {
          const t = s.get(r);
          if (t) {
            const a = e.getIntegrityForPrecacheKey(t);
            return { cacheKey: t, integrity: a };
          }
        }
      }, e.precacheStrategy);
    }
  }
  const e_ = "www.google-analytics.com",
    eb = "www.googletagmanager.com",
    ex = /^\/(\w+\/)?collect/,
    eE =
      (e) =>
      async ({ queue: t }) => {
        let a;
        while ((a = await t.shiftRequest())) {
          const { request: s, timestamp: r } = a,
            n = new URL(s.url);
          try {
            const t =
                "POST" === s.method
                  ? new URLSearchParams(await s.clone().text())
                  : n.searchParams,
              a = r - (Number(t.get("qt")) || 0),
              i = Date.now() - a;
            if ((t.set("qt", String(i)), e.parameterOverrides))
              for (const a of Object.keys(e.parameterOverrides)) {
                const s = e.parameterOverrides[a];
                t.set(a, s);
              }
            "function" == typeof e.hitFilter && e.hitFilter.call(null, t),
              await fetch(
                new Request(n.origin + n.pathname, {
                  body: t.toString(),
                  method: "POST",
                  mode: "cors",
                  credentials: "omit",
                  headers: { "Content-Type": "text/plain" },
                }),
              );
          } catch (e) {
            throw (await t.unshiftRequest(a), e);
          }
        }
      },
    ev = (e) => {
      const t = ({ url: e }) => e.hostname === e_ && ex.test(e.pathname),
        a = new X({ plugins: [e] });
      return [new K(t, a, "GET"), new K(t, a, "POST")];
    },
    eR = (e) =>
      new K(
        ({ url: e }) => e.hostname === e_ && "/analytics.js" === e.pathname,
        new Y({ cacheName: e }),
        "GET",
      ),
    eq = (e) =>
      new K(
        ({ url: e }) => e.hostname === eb && "/gtag/js" === e.pathname,
        new Y({ cacheName: e }),
        "GET",
      ),
    eS = (e) =>
      new K(
        ({ url: e }) => e.hostname === eb && "/gtm.js" === e.pathname,
        new Y({ cacheName: e }),
        "GET",
      ),
    eD = ({ serwist: e, cacheName: t, ...a }) => {
      const s = l.getGoogleAnalyticsName(t),
        r = new el("serwist-google-analytics", {
          maxRetentionTime: 2880,
          onSync: eE(a),
        });
      for (const t of [eS(s), eR(s), eq(s), ...ev(r)]) e.registerRoute(t);
    };
  class eN {
    _fallbackUrls;
    _serwist;
    constructor({ fallbackUrls: e, serwist: t }) {
      (this._fallbackUrls = e), (this._serwist = t);
    }
    async handlerDidError(e) {
      for (const t of this._fallbackUrls)
        if ("string" == typeof t) {
          const e = await this._serwist.matchPrecache(t);
          if (void 0 !== e) return e;
        } else if (t.matcher(e)) {
          const e = await this._serwist.matchPrecache(t.url);
          if (void 0 !== e) return e;
        }
    }
  }
  class eP {
    _precacheController;
    constructor({ precacheController: e }) {
      this._precacheController = e;
    }
    cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
      const a =
        t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url);
      return a ? new Request(a, { headers: e.headers }) : e;
    };
  }
  const eC = (e, t = {}) => {
    const {
      cacheName: a,
      plugins: s = [],
      fetchOptions: r,
      matchOptions: n,
      fallbackToNetwork: i,
      directoryIndex: c,
      ignoreURLParametersMatching: o,
      cleanURLs: h,
      urlManipulation: u,
      cleanupOutdatedCaches: d,
      concurrency: m = 10,
      navigateFallback: f,
      navigateFallbackAllowlist: g,
      navigateFallbackDenylist: p,
    } = t ?? {};
    return {
      precacheStrategyOptions: {
        cacheName: l.getPrecacheName(a),
        plugins: [...s, new eP({ precacheController: e })],
        fetchOptions: r,
        matchOptions: n,
        fallbackToNetwork: i,
      },
      precacheRouteOptions: {
        directoryIndex: c,
        ignoreURLParametersMatching: o,
        cleanURLs: h,
        urlManipulation: u,
      },
      precacheMiscOptions: {
        cleanupOutdatedCaches: d,
        concurrency: m,
        navigateFallback: f,
        navigateFallbackAllowlist: g,
        navigateFallbackDenylist: p,
      },
    };
  };
  class eT {
    _urlsToCacheKeys = new Map();
    _urlsToCacheModes = new Map();
    _cacheKeysToIntegrities = new Map();
    _concurrentPrecaching;
    _precacheStrategy;
    _routes;
    _defaultHandlerMap;
    _catchHandler;
    constructor({
      precacheEntries: e,
      precacheOptions: t,
      skipWaiting: a = !1,
      importScripts: s,
      navigationPreload: r = !1,
      cacheId: n,
      clientsClaim: i = !1,
      runtimeCaching: c,
      offlineAnalyticsConfig: o,
      disableDevLogs: l = !1,
      fallbacks: h,
    } = {}) {
      const {
        precacheStrategyOptions: u,
        precacheRouteOptions: d,
        precacheMiscOptions: m,
      } = eC(this, t);
      if (
        ((this._concurrentPrecaching = m.concurrency),
        (this._precacheStrategy = new eu(u)),
        (this._routes = new Map()),
        (this._defaultHandlerMap = new Map()),
        (this.handleInstall = this.handleInstall.bind(this)),
        (this.handleActivate = this.handleActivate.bind(this)),
        (this.handleFetch = this.handleFetch.bind(this)),
        (this.handleCache = this.handleCache.bind(this)),
        s && s.length > 0 && self.importScripts(...s),
        r && em(),
        void 0 !== n && ef({ prefix: n }),
        a
          ? self.skipWaiting()
          : self.addEventListener("message", (e) => {
              e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
            }),
        i && _(),
        e && e.length > 0 && this.addToPrecacheList(e),
        m.cleanupOutdatedCaches && y(u.cacheName),
        this.registerRoute(new ey(this, d)),
        m.navigateFallback &&
          this.registerRoute(
            new W(this.createHandlerBoundToUrl(m.navigateFallback), {
              allowlist: m.navigateFallbackAllowlist,
              denylist: m.navigateFallbackDenylist,
            }),
          ),
        void 0 !== o &&
          ("boolean" == typeof o
            ? o && eD({ serwist: this })
            : eD({ ...o, serwist: this })),
        void 0 !== c)
      ) {
        if (void 0 !== h) {
          const e = new eN({ fallbackUrls: h.entries, serwist: this });
          c.forEach((t) => {
            t.handler instanceof z &&
              !t.handler.plugins.some((e) => "handlerDidError" in e) &&
              t.handler.plugins.push(e);
          });
        }
        for (const e of c) this.registerCapture(e.matcher, e.handler, e.method);
      }
      l && G();
    }
    get precacheStrategy() {
      return this._precacheStrategy;
    }
    get routes() {
      return this._routes;
    }
    addEventListeners() {
      self.addEventListener("install", this.handleInstall),
        self.addEventListener("activate", this.handleActivate),
        self.addEventListener("fetch", this.handleFetch),
        self.addEventListener("message", this.handleCache);
    }
    addToPrecacheList(e) {
      const t = [];
      for (const a of e) {
        "string" == typeof a
          ? t.push(a)
          : a && !a.integrity && void 0 === a.revision && t.push(a.url);
        const { cacheKey: e, url: s } = ep(a),
          n = "string" != typeof a && a.revision ? "reload" : "default";
        if (this._urlsToCacheKeys.has(s) && this._urlsToCacheKeys.get(s) !== e)
          throw new r("add-to-cache-list-conflicting-entries", {
            firstEntry: this._urlsToCacheKeys.get(s),
            secondEntry: e,
          });
        if ("string" != typeof a && a.integrity) {
          if (
            this._cacheKeysToIntegrities.has(e) &&
            this._cacheKeysToIntegrities.get(e) !== a.integrity
          )
            throw new r("add-to-cache-list-conflicting-integrities", {
              url: s,
            });
          this._cacheKeysToIntegrities.set(e, a.integrity);
        }
        this._urlsToCacheKeys.set(s, e),
          this._urlsToCacheModes.set(s, n),
          t.length > 0 &&
            console.warn(`Serwist is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`);
      }
    }
    handleInstall(e) {
      return b(e, async () => {
        const t = new eg();
        this.precacheStrategy.plugins.push(t),
          await H(
            this._concurrentPrecaching,
            Array.from(this._urlsToCacheKeys.entries()),
            async ([t, a]) => {
              const s = this._cacheKeysToIntegrities.get(a),
                r = this._urlsToCacheModes.get(t),
                n = new Request(t, {
                  integrity: s,
                  cache: r,
                  credentials: "same-origin",
                });
              await Promise.all(
                this.precacheStrategy.handleAll({
                  event: e,
                  request: n,
                  url: new URL(n.url),
                  params: { cacheKey: a },
                }),
              );
            },
          );
        const { updatedURLs: a, notUpdatedURLs: s } = t;
        return { updatedURLs: a, notUpdatedURLs: s };
      });
    }
    handleActivate(e) {
      return b(e, async () => {
        const e = await self.caches.open(this.precacheStrategy.cacheName),
          t = await e.keys(),
          a = new Set(this._urlsToCacheKeys.values()),
          s = [];
        for (const r of t) a.has(r.url) || (await e.delete(r), s.push(r.url));
        return { deletedCacheRequests: s };
      });
    }
    handleFetch(e) {
      const { request: t } = e,
        a = this.handleRequest({ request: t, event: e });
      a && e.respondWith(a);
    }
    handleCache(e) {
      if (e.data && "CACHE_URLS" === e.data.type) {
        const { payload: t } = e.data,
          a = Promise.all(
            t.urlsToCache.map((t) => {
              let a;
              return (
                (a = "string" == typeof t ? new Request(t) : new Request(...t)),
                this.handleRequest({ request: a, event: e })
              );
            }),
          );
        e.waitUntil(a),
          e.ports?.[0] && a.then(() => e.ports[0].postMessage(!0));
      }
    }
    setDefaultHandler(e, t = "GET") {
      this._defaultHandlerMap.set(t, B(e));
    }
    setCatchHandler(e) {
      this._catchHandler = B(e);
    }
    registerCapture(e, t, a) {
      const s = ew(e, t, a);
      return this.registerRoute(s), s;
    }
    registerRoute(e) {
      this._routes.has(e.method) || this._routes.set(e.method, []),
        this._routes.get(e.method).push(e);
    }
    unregisterRoute(e) {
      if (!this._routes.has(e.method))
        throw new r("unregister-route-but-not-found-with-method", {
          method: e.method,
        });
      const t = this._routes.get(e.method).indexOf(e);
      if (t > -1) this._routes.get(e.method).splice(t, 1);
      else throw new r("unregister-route-route-not-registered");
    }
    getUrlsToPrecacheKeys() {
      return this._urlsToCacheKeys;
    }
    getPrecachedUrls() {
      return [...this._urlsToCacheKeys.keys()];
    }
    getPrecacheKeyForUrl(e) {
      const t = new URL(e, location.href);
      return this._urlsToCacheKeys.get(t.href);
    }
    getIntegrityForPrecacheKey(e) {
      return this._cacheKeysToIntegrities.get(e);
    }
    async matchPrecache(e) {
      const t = e instanceof Request ? e.url : e,
        a = this.getPrecacheKeyForUrl(t);
      if (a)
        return (await self.caches.open(this.precacheStrategy.cacheName)).match(
          a,
        );
    }
    createHandlerBoundToUrl(e) {
      const t = this.getPrecacheKeyForUrl(e);
      if (!t) throw new r("non-precached-url", { url: e });
      return (a) => (
        (a.request = new Request(e)),
        (a.params = { cacheKey: t, ...a.params }),
        this.precacheStrategy.handle(a)
      );
    }
    handleRequest({ request: e, event: t }) {
      let a;
      const s = new URL(e.url, location.href);
      if (!s.protocol.startsWith("http")) return;
      let r = s.origin === location.origin,
        { params: n, route: i } = this.findMatchingRoute({
          event: t,
          request: e,
          sameOrigin: r,
          url: s,
        }),
        c = i?.handler,
        o = e.method;
      if (
        (!c &&
          this._defaultHandlerMap.has(o) &&
          (c = this._defaultHandlerMap.get(o)),
        !c)
      )
        return;
      try {
        a = c.handle({ url: s, request: e, event: t, params: n });
      } catch (e) {
        a = Promise.reject(e);
      }
      const l = i?.catchHandler;
      return (
        a instanceof Promise &&
          (this._catchHandler || l) &&
          (a = a.catch(async (a) => {
            if (l)
              try {
                return await l.handle({
                  url: s,
                  request: e,
                  event: t,
                  params: n,
                });
              } catch (e) {
                e instanceof Error && (a = e);
              }
            if (this._catchHandler)
              return this._catchHandler.handle({
                url: s,
                request: e,
                event: t,
              });
            throw a;
          })),
        a
      );
    }
    findMatchingRoute({ url: e, sameOrigin: t, request: a, event: s }) {
      for (const r of this._routes.get(a.method) || []) {
        let n;
        const i = r.match({ url: e, sameOrigin: t, request: a, event: s });
        if (i)
          return (
            Array.isArray((n = i)) && 0 === n.length
              ? (n = void 0)
              : i.constructor === Object && 0 === Object.keys(i).length
                ? (n = void 0)
                : "boolean" == typeof i && (n = void 0),
            { route: r, params: n }
          );
      }
      return {};
    }
  }
  "undefined" != typeof navigator &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const eA = "cache-entries",
    ek = (e) => {
      const t = new URL(e, location.href);
      return (t.hash = ""), t.href;
    };
  class eI {
    _cacheName;
    _db = null;
    constructor(e) {
      this._cacheName = e;
    }
    _getId(e) {
      return `${this._cacheName}|${ek(e)}`;
    }
    _upgradeDb(e) {
      const t = e.createObjectStore(eA, { keyPath: "id" });
      t.createIndex("cacheName", "cacheName", { unique: !1 }),
        t.createIndex("timestamp", "timestamp", { unique: !1 });
    }
    _upgradeDbAndDeleteOldDbs(e) {
      this._upgradeDb(e),
        this._cacheName &&
          ((e, { blocked: t } = {}) => {
            const a = indexedDB.deleteDatabase(e);
            t && a.addEventListener("blocked", (e) => t(e.oldVersion, e)),
              S(a).then(() => void 0);
          })(this._cacheName);
    }
    async setTimestamp(e, t) {
      e = ek(e);
      const a = {
          id: this._getId(e),
          cacheName: this._cacheName,
          url: e,
          timestamp: t,
        },
        s = (await this.getDb()).transaction(eA, "readwrite", {
          durability: "relaxed",
        });
      await s.store.put(a), await s.done;
    }
    async getTimestamp(e) {
      const t = await this.getDb(),
        a = await t.get(eA, this._getId(e));
      return a?.timestamp;
    }
    async expireEntries(e, t) {
      let a = await this.getDb(),
        s = await a
          .transaction(eA, "readwrite")
          .store.index("timestamp")
          .openCursor(null, "prev"),
        r = [],
        n = 0;
      while (s) {
        const a = s.value;
        a.cacheName === this._cacheName &&
          ((e && a.timestamp < e) || (t && n >= t)
            ? (s.delete(), r.push(a.url))
            : n++),
          (s = await s.continue());
      }
      return r;
    }
    async getDb() {
      return (
        this._db ||
          (this._db = await N("serwist-expiration", 1, {
            upgrade: this._upgradeDbAndDeleteOldDbs.bind(this),
          })),
        this._db
      );
    }
  }
  class eU {
    _isRunning = !1;
    _rerunRequested = !1;
    _maxEntries;
    _maxAgeSeconds;
    _matchOptions;
    _cacheName;
    _timestampModel;
    constructor(e, t = {}) {
      (this._maxEntries = t.maxEntries),
        (this._maxAgeSeconds = t.maxAgeSeconds),
        (this._matchOptions = t.matchOptions),
        (this._cacheName = e),
        (this._timestampModel = new eI(e));
    }
    async expireEntries() {
      if (this._isRunning) {
        this._rerunRequested = !0;
        return;
      }
      this._isRunning = !0;
      const e = this._maxAgeSeconds
          ? Date.now() - 1e3 * this._maxAgeSeconds
          : 0,
        t = await this._timestampModel.expireEntries(e, this._maxEntries),
        a = await self.caches.open(this._cacheName);
      for (const e of t) await a.delete(e, this._matchOptions);
      (this._isRunning = !1),
        this._rerunRequested &&
          ((this._rerunRequested = !1), this.expireEntries());
    }
    async updateTimestamp(e) {
      await this._timestampModel.setTimestamp(e, Date.now());
    }
    async isURLExpired(e) {
      if (!this._maxAgeSeconds) return !1;
      const t = await this._timestampModel.getTimestamp(e),
        a = Date.now() - 1e3 * this._maxAgeSeconds;
      return void 0 === t || t < a;
    }
    async delete() {
      (this._rerunRequested = !1),
        await this._timestampModel.expireEntries(Number.POSITIVE_INFINITY);
    }
  }
  const eL = (e) => {
    m.add(e);
  };
  class eF {
    _config;
    _cacheExpirations;
    constructor(e = {}) {
      (this._config = e),
        (this._cacheExpirations = new Map()),
        this._config.maxAgeFrom || (this._config.maxAgeFrom = "last-fetched"),
        this._config.purgeOnQuotaError &&
          eL(() => this.deleteCacheAndMetadata());
    }
    _getCacheExpiration(e) {
      if (e === l.getRuntimeName()) throw new r("expire-custom-caches-only");
      let t = this._cacheExpirations.get(e);
      return (
        t || ((t = new eU(e, this._config)), this._cacheExpirations.set(e, t)),
        t
      );
    }
    cachedResponseWillBeUsed({
      event: e,
      cacheName: t,
      request: a,
      cachedResponse: s,
    }) {
      if (!s) return null;
      const r = this._isResponseDateFresh(s),
        n = this._getCacheExpiration(t),
        i = "last-used" === this._config.maxAgeFrom,
        c = (async () => {
          i && (await n.updateTimestamp(a.url)), await n.expireEntries();
        })();
      try {
        e.waitUntil(c);
      } catch (e) {}
      return r ? s : null;
    }
    _isResponseDateFresh(e) {
      if ("last-used" === this._config.maxAgeFrom) return !0;
      const t = Date.now();
      if (!this._config.maxAgeSeconds) return !0;
      const a = this._getDateHeaderTimestamp(e);
      return null === a || a >= t - 1e3 * this._config.maxAgeSeconds;
    }
    _getDateHeaderTimestamp(e) {
      if (!e.headers.has("date")) return null;
      const t = new Date(e.headers.get("date")).getTime();
      return Number.isNaN(t) ? null : t;
    }
    async cacheDidUpdate({ cacheName: e, request: t }) {
      const a = this._getCacheExpiration(e);
      await a.updateTimestamp(t.url), await a.expireEntries();
    }
    async deleteCacheAndMetadata() {
      for (const [e, t] of this._cacheExpirations)
        await self.caches.delete(e), await t.delete();
      this._cacheExpirations = new Map();
    }
  }
  const eO = (e, t, a) => {
      let s, n;
      const i = e.size;
      if ((a && a > i) || (t && t < 0))
        throw new r("range-not-satisfiable", { size: i, end: a, start: t });
      return (
        void 0 !== t && void 0 !== a
          ? ((s = t), (n = a + 1))
          : void 0 !== t && void 0 === a
            ? ((s = t), (n = i))
            : void 0 !== a && void 0 === t && ((s = i - a), (n = i)),
        { start: s, end: n }
      );
    },
    eM = (e) => {
      const t = e.trim().toLowerCase();
      if (!t.startsWith("bytes="))
        throw new r("unit-must-be-bytes", { normalizedRangeHeader: t });
      if (t.includes(","))
        throw new r("single-range-only", { normalizedRangeHeader: t });
      const a = /(\d*)-(\d*)/.exec(t);
      if (!a || !(a[1] || a[2]))
        throw new r("invalid-range-values", { normalizedRangeHeader: t });
      return {
        start: "" === a[1] ? void 0 : Number(a[1]),
        end: "" === a[2] ? void 0 : Number(a[2]),
      };
    },
    eB = async (e, t) => {
      try {
        if (206 === t.status) return t;
        const a = e.headers.get("range");
        if (!a) throw new r("no-range-header");
        const s = eM(a),
          n = await t.blob(),
          i = eO(n, s.start, s.end),
          c = n.slice(i.start, i.end),
          o = c.size,
          l = new Response(c, {
            status: 206,
            statusText: "Partial Content",
            headers: t.headers,
          });
        return (
          l.headers.set("Content-Length", String(o)),
          l.headers.set(
            "Content-Range",
            `bytes ${i.start}-${i.end - 1}/${n.size}`,
          ),
          l
        );
      } catch (e) {
        return new Response("", {
          status: 416,
          statusText: "Range Not Satisfiable",
        });
      }
    };
  class eK {
    cachedResponseWillBeUsed = async ({ request: e, cachedResponse: t }) =>
      t && e.headers.has("range") ? await eB(e, t) : t;
  }
  class eW extends z {
    async _handle(e, t) {
      let a,
        s = await t.cacheMatch(e);
      if (!s)
        try {
          s = await t.fetchAndCachePut(e);
        } catch (e) {
          e instanceof Error && (a = e);
        }
      if (!s) throw new r("no-response", { url: e.url, error: a });
      return s;
    }
  }
  class ej extends z {
    constructor(e = {}) {
      super(e),
        this.plugins.some((e) => "cacheWillUpdate" in e) ||
          this.plugins.unshift(J);
    }
    async _handle(e, t) {
      let a;
      const s = t.fetchAndCachePut(e).catch(() => {});
      t.waitUntil(s);
      let n = await t.cacheMatch(e);
      if (n);
      else
        try {
          n = await s;
        } catch (e) {
          e instanceof Error && (a = e);
        }
      if (!n) throw new r("no-response", { url: e.url, error: a });
      return n;
    }
  }
  const e$ = {
      rscPrefetch: "pages-rsc-prefetch",
      rsc: "pages-rsc",
      html: "pages",
    },
    eH = [
      {
        matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: new eW({
          cacheName: "google-fonts-webfonts",
          plugins: [
            new eF({
              maxEntries: 4,
              maxAgeSeconds: 31536e3,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: new ej({
          cacheName: "google-fonts-stylesheets",
          plugins: [
            new eF({
              maxEntries: 4,
              maxAgeSeconds: 604800,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: new ej({
          cacheName: "static-font-assets",
          plugins: [
            new eF({
              maxEntries: 4,
              maxAgeSeconds: 604800,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: new ej({
          cacheName: "static-image-assets",
          plugins: [
            new eF({
              maxEntries: 64,
              maxAgeSeconds: 2592e3,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\/_next\/static.+\.js$/i,
        handler: new eW({
          cacheName: "next-static-js-assets",
          plugins: [
            new eF({
              maxEntries: 64,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\/_next\/image\?url=.+$/i,
        handler: new ej({
          cacheName: "next-image",
          plugins: [
            new eF({
              maxEntries: 64,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\.(?:mp3|wav|ogg)$/i,
        handler: new eW({
          cacheName: "static-audio-assets",
          plugins: [
            new eF({
              maxEntries: 32,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
            new eK(),
          ],
        }),
      },
      {
        matcher: /\.(?:mp4|webm)$/i,
        handler: new eW({
          cacheName: "static-video-assets",
          plugins: [
            new eF({
              maxEntries: 32,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
            new eK(),
          ],
        }),
      },
      {
        matcher: /\.(?:js)$/i,
        handler: new ej({
          cacheName: "static-js-assets",
          plugins: [
            new eF({
              maxEntries: 48,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\.(?:css|less)$/i,
        handler: new ej({
          cacheName: "static-style-assets",
          plugins: [
            new eF({
              maxEntries: 32,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\/_next\/data\/.+\/.+\.json$/i,
        handler: new Y({
          cacheName: "next-data",
          plugins: [
            new eF({
              maxEntries: 32,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: /\.(?:json|xml|csv)$/i,
        handler: new Y({
          cacheName: "static-data-assets",
          plugins: [
            new eF({
              maxEntries: 32,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
        }),
      },
      {
        matcher: ({ sameOrigin: e, url: { pathname: t } }) =>
          !(!e || t.startsWith("/api/auth/callback")) &&
          !!t.startsWith("/api/"),
        method: "GET",
        handler: new Y({
          cacheName: "apis",
          plugins: [
            new eF({
              maxEntries: 16,
              maxAgeSeconds: 86400,
              maxAgeFrom: "last-used",
            }),
          ],
          networkTimeoutSeconds: 10,
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          "1" === e.headers.get("RSC") &&
          "1" === e.headers.get("Next-Router-Prefetch") &&
          a &&
          !t.startsWith("/api/"),
        handler: new Y({
          cacheName: e$.rscPrefetch,
          plugins: [new eF({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          "1" === e.headers.get("RSC") && a && !t.startsWith("/api/"),
        handler: new Y({
          cacheName: e$.rsc,
          plugins: [new eF({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          e.headers.get("Content-Type")?.includes("text/html") &&
          a &&
          !t.startsWith("/api/"),
        handler: new Y({
          cacheName: e$.html,
          plugins: [new eF({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ url: { pathname: e }, sameOrigin: t }) =>
          t && !e.startsWith("/api/"),
        handler: new Y({
          cacheName: "others",
          plugins: [new eF({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ sameOrigin: e }) => !e,
        handler: new Y({
          cacheName: "cross-origin",
          plugins: [new eF({ maxEntries: 32, maxAgeSeconds: 3600 })],
          networkTimeoutSeconds: 10,
        }),
      },
    ];
  new eT({
    precacheEntries: [
      {
        revision: "711beb7ce762b90dad33ac1e4d55d79d",
        url: "/_next/static/WREGaVWeyjF0jVDQhZUnW/_buildManifest.js",
      },
      {
        revision: "b6652df95db52feb4daf4eca35380933",
        url: "/_next/static/WREGaVWeyjF0jVDQhZUnW/_ssgManifest.js",
      },
      { revision: null, url: "/_next/static/chunks/300-b4adaee5b380dda2.js" },
      { revision: null, url: "/_next/static/chunks/836-3e95f200cd873b4a.js" },
      {
        revision: null,
        url: "/_next/static/chunks/85da7051-9a1ed70492609ec1.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/app/_not-found/page-9b15d5201cd1d35f.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/app/layout-83e049957e3724ae.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/app/page-29d0078c9ea45bce.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/framework-b7c8454eeb0c5b96.js",
      },
      { revision: null, url: "/_next/static/chunks/main-158baba76d9c5e40.js" },
      {
        revision: null,
        url: "/_next/static/chunks/main-app-65de445de2743739.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/pages/_app-dfa9882c8527b228.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/pages/_error-ebdd296cf145a4e7.js",
      },
      {
        revision: "846118c33b2c0e922d7b3a7676f81f6f",
        url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
      },
      {
        revision: null,
        url: "/_next/static/chunks/webpack-4237e044bf90dc1d.js",
      },
      { revision: null, url: "/_next/static/css/78e485687a20d290.css" },
      {
        revision: "80a5d865c63ba642a927daba54438305",
        url: "/weather-icons/cloudy-day-1.svg",
      },
      {
        revision: "b931d84d75a673fdd8ae1134fefd98ba",
        url: "/weather-icons/cloudy-day-2.svg",
      },
      {
        revision: "109368f632c5dafab6cbf47ec386f8d0",
        url: "/weather-icons/cloudy-day-3.svg",
      },
      {
        revision: "7e65840bf2249d8f7ba19fc029438545",
        url: "/weather-icons/cloudy-night-1.svg",
      },
      {
        revision: "ef1c6aa1ca72ea2157736318d24ede62",
        url: "/weather-icons/cloudy-night-2.svg",
      },
      {
        revision: "bf91ac0f97cf729862dfaeb8fc25e037",
        url: "/weather-icons/cloudy-night-3.svg",
      },
      {
        revision: "ad789581dd3bfe802dd2e6ea0c2f5caa",
        url: "/weather-icons/cloudy.svg",
      },
      {
        revision: "7f93fbdb8a9d02fe414c0a0119b77bd4",
        url: "/weather-icons/day.svg",
      },
      {
        revision: "a3f3f38d2c17971938ebd891fb6bbd0c",
        url: "/weather-icons/night.svg",
      },
      {
        revision: "f134a51c3c0a49f33fecc7a201a4e075",
        url: "/weather-icons/rainy-1.svg",
      },
      {
        revision: "35eb268dd7e8dfe694b55fec314a0b10",
        url: "/weather-icons/rainy-2.svg",
      },
      {
        revision: "c17e7a5d3d1b7d702bc8c640a36f68c6",
        url: "/weather-icons/rainy-3.svg",
      },
      {
        revision: "c8cdb21695a664b4dbffeb1fc9631510",
        url: "/weather-icons/rainy-4.svg",
      },
      {
        revision: "2bd236411dc612e871d9c314239c3fa7",
        url: "/weather-icons/rainy-5.svg",
      },
      {
        revision: "d235ab65ea35c3fcade47b8f5c6c4ae7",
        url: "/weather-icons/rainy-6.svg",
      },
      {
        revision: "c915395f8c3e3571d734680505ceeb11",
        url: "/weather-icons/rainy-7.svg",
      },
      {
        revision: "f78cba60ad28e30ea060d424f114670a",
        url: "/weather-icons/snowy-1.svg",
      },
      {
        revision: "d103c77cf7f40bc52812fe945ddd3cfa",
        url: "/weather-icons/snowy-2.svg",
      },
      {
        revision: "b6eea2cf5e8a5ab5f57405addab863ae",
        url: "/weather-icons/snowy-3.svg",
      },
      {
        revision: "474b6da7e78dc3dadc11766d80f7eaca",
        url: "/weather-icons/snowy-4.svg",
      },
      {
        revision: "3def7c9fb95731ac622871fb6925d5f6",
        url: "/weather-icons/snowy-5.svg",
      },
      {
        revision: "67d63a14dbbef1d431f1851da197e0ae",
        url: "/weather-icons/snowy-6.svg",
      },
      {
        revision: "7142c78bba5ddb0b77c3ccddcebe96ab",
        url: "/weather-icons/thunder.svg",
      },
      {
        revision: "2738019da90b9fac396ae4397e017adb",
        url: "/weather-icons/weather-sprite.svg",
      },
      {
        revision: "56c46d80c13ec13e8d5062a8d53620b7",
        url: "/weather-icons/weather.svg",
      },
    ],
    skipWaiting: !0,
    clientsClaim: !0,
    navigationPreload: !0,
    runtimeCaching: eH,
    fallbacks: {
      entries: [
        {
          url: "/offline",
          matcher(e) {
            const { request: t } = e;
            return "document" === t.destination;
          },
        },
      ],
    },
  }).addEventListeners();
})();
