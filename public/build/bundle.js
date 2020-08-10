
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    let gameState = writable(
      {
        round: 1,
        turn: 0,
        status: "",
        dicesArr: [0,0,0,0]
      }
    );

    let game = writable(
      {
        points: [],
        won: null
      }
    );



    let board = writable(
      [{
        col: [
          [13, 14, 15, 0, 1, 2, 3, 4],
          [12, 11, 10, 9, 8, 7, 6, 5],
          [13, 14, 15, 0, 1, 2, 3, 4]
        ]
      },
      {
        col: [
          [{}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}],
          [{}, {}, {}, {}, {}, {}, {}, {}]
        ]
      },
      ]
    );


    let pawns = writable(
      [
        [
          { loc: 0, p: 1, id: 1 },
          { loc: 0, p: 1, id: 2 },
          { loc: 0, p: 1, id: 3 },
          { loc: 0, p: 1, id: 4 },
          { loc: 0, p: 1, id: 5 },
          { loc: 0, p: 1, id: 6 },
          { loc: 0, p: 1, id: 7 }
        ],
        [
          { loc: 0, p: 2, id: 1 },
          { loc: 0, p: 2, id: 2 },
          { loc: 0, p: 2, id: 3 },
          { loc: 0, p: 2, id: 4 },
          { loc: 0, p: 2, id: 5 },
          { loc: 0, p: 2, id: 6 },
          { loc: 0, p: 2, id: 7 }
        ]
      ]
    );
    //export let pawns[1] = writable();

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function crossfade(_a) {
        var { fallback } = _a, defaults = __rest(_a, ["fallback"]);
        const to_receive = new Map();
        const to_send = new Map();
        function crossfade(from, node, params) {
            const { delay = 0, duration = d => Math.sqrt(d) * 30, easing = cubicOut } = assign(assign({}, defaults), params);
            const to = node.getBoundingClientRect();
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const dw = from.width / to.width;
            const dh = from.height / to.height;
            const d = Math.sqrt(dx * dx + dy * dy);
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            const opacity = +style.opacity;
            return {
                delay,
                duration: is_function(duration) ? duration(d) : duration,
                easing,
                css: (t, u) => `
				opacity: ${t * opacity};
				transform-origin: top left;
				transform: ${transform} translate(${u * dx}px,${u * dy}px) scale(${t + (1 - t) * dw}, ${t + (1 - t) * dh});
			`
            };
        }
        function transition(items, counterparts, intro) {
            return (node, params) => {
                items.set(params.key, {
                    rect: node.getBoundingClientRect()
                });
                return () => {
                    if (counterparts.has(params.key)) {
                        const { rect } = counterparts.get(params.key);
                        counterparts.delete(params.key);
                        return crossfade(rect, node, params);
                    }
                    // if the node is disappearing altogether
                    // (i.e. wasn't claimed by the other list)
                    // then we need to supply an outro
                    items.delete(params.key);
                    return fallback && fallback(node, params, intro);
                };
            };
        }
        return [
            transition(to_send, to_receive, false),
            transition(to_receive, to_send, true)
        ];
    }

    function flip(node, animation, params) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/Pawn.svelte generated by Svelte v3.24.0 */

    const { console: console_1 } = globals;
    const file = "src/Pawn.svelte";

    // (88:0) {#if aPawnSpotted !== undefined}
    function create_if_block(ctx) {
    	let div;
    	let t0_value = /*aPawnSpotted*/ ctx[0].p + "";
    	let t0;
    	let t1;
    	let t2_value = /*aPawnSpotted*/ ctx[0].id + "";
    	let t2;
    	let t3;
    	let t4;
    	let t5;
    	let t6_value = /*aPawnSpotted*/ ctx[0].loc + "";
    	let t6;
    	let div_data_owner_value;
    	let div_data_pawnname_value;
    	let div_intro;
    	let div_outro;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = text(t2_value);
    			t3 = text(".");
    			t4 = text(/*key*/ ctx[1]);
    			t5 = text(".");
    			t6 = text(t6_value);
    			attr_dev(div, "class", "pawn");
    			attr_dev(div, "data-owner", div_data_owner_value = /*aPawnSpotted*/ ctx[0].p);
    			attr_dev(div, "data-pawnname", div_data_pawnname_value = /*aPawnSpotted*/ ctx[0].id);
    			add_location(div, file, 92, 0, 2208);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, t4);
    			append_dev(div, t5);
    			append_dev(div, t6);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*aPawnSpotted*/ 1) && t0_value !== (t0_value = /*aPawnSpotted*/ ctx[0].p + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*aPawnSpotted*/ 1) && t2_value !== (t2_value = /*aPawnSpotted*/ ctx[0].id + "")) set_data_dev(t2, t2_value);
    			if (!current || dirty & /*key*/ 2) set_data_dev(t4, /*key*/ ctx[1]);
    			if ((!current || dirty & /*aPawnSpotted*/ 1) && t6_value !== (t6_value = /*aPawnSpotted*/ ctx[0].loc + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*aPawnSpotted*/ 1 && div_data_owner_value !== (div_data_owner_value = /*aPawnSpotted*/ ctx[0].p)) {
    				attr_dev(div, "data-owner", div_data_owner_value);
    			}

    			if (!current || dirty & /*aPawnSpotted*/ 1 && div_data_pawnname_value !== (div_data_pawnname_value = /*aPawnSpotted*/ ctx[0].id)) {
    				attr_dev(div, "data-pawnname", div_data_pawnname_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				if (!div_intro) div_intro = create_in_transition(div, /*receive*/ ctx[3], { key: /*key*/ ctx[1] });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, /*send*/ ctx[2], { key: /*key*/ ctx[1] });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(88:0) {#if aPawnSpotted !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*aPawnSpotted*/ ctx[0] !== undefined && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*aPawnSpotted*/ ctx[0] !== undefined) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*aPawnSpotted*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $pawns;
    	validate_store(pawns, "pawns");
    	component_subscribe($$self, pawns, $$value => $$invalidate(7, $pawns = $$value));

    	const [send, receive] = crossfade({
    		duration: d => Math.sqrt(d * 200),
    		fallback(node, params) {
    			const style = getComputedStyle(node);
    			const transform = style.transform === "none" ? "" : style.transform;

    			return {
    				duration: 600,
    				easing: quintOut,
    				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
    			};
    		}
    	});

    	let residingPawn;

    	const qS = a => {
    		return document.querySelector(a);
    	};

    	const qA = a => {
    		return document.querySelectorAll(a);
    	};

    	let { col } = $$props;
    	let { loc } = $$props;
    	let owner;

    	let type = function (c) {
    		return c < 5 || 12 < c ? "safe" : "combat";
    	};

    	let spotPawn = function () {
    		//if (type(loc) === "safe")
    		return true;
    	};

    	let aPawnSpotted;
    	let Paw;
    	let key;
    	const writable_props = ["col", "loc"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Pawn> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pawn", $$slots, []);

    	$$self.$set = $$props => {
    		if ("col" in $$props) $$invalidate(4, col = $$props.col);
    		if ("loc" in $$props) $$invalidate(5, loc = $$props.loc);
    	};

    	$$self.$capture_state = () => ({
    		gameState,
    		board,
    		pawns,
    		fade,
    		flip,
    		quintOut,
    		crossfade,
    		send,
    		receive,
    		residingPawn,
    		qS,
    		qA,
    		col,
    		loc,
    		owner,
    		type,
    		spotPawn,
    		aPawnSpotted,
    		Paw,
    		key,
    		$pawns
    	});

    	$$self.$inject_state = $$props => {
    		if ("residingPawn" in $$props) residingPawn = $$props.residingPawn;
    		if ("col" in $$props) $$invalidate(4, col = $$props.col);
    		if ("loc" in $$props) $$invalidate(5, loc = $$props.loc);
    		if ("owner" in $$props) $$invalidate(6, owner = $$props.owner);
    		if ("type" in $$props) $$invalidate(11, type = $$props.type);
    		if ("spotPawn" in $$props) spotPawn = $$props.spotPawn;
    		if ("aPawnSpotted" in $$props) $$invalidate(0, aPawnSpotted = $$props.aPawnSpotted);
    		if ("Paw" in $$props) Paw = $$props.Paw;
    		if ("key" in $$props) $$invalidate(1, key = $$props.key);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$pawns, loc, col, owner, aPawnSpotted*/ 241) {
    			 {
    				for (let i = 0; i < 2; i++) {
    					//      console.log($pawns[i]);
    					let p = $pawns[i];

    					//      if ($pawns[i] === 2) break;
    					if (type(loc) === "safe") {
    						$$invalidate(6, owner = col === 0 ? 1 : 2);
    						$$invalidate(0, aPawnSpotted = p.find(e => e.loc === loc && e.p === owner));
    					} else {
    						$$invalidate(0, aPawnSpotted = p.find(e => e.loc === loc));
    					}

    					//aPawnSpotted = p.find((e) => e.loc === loc && e.p === owner);
    					if (!!aPawnSpotted) {
    						$$invalidate(0, aPawnSpotted.key = aPawnSpotted.p + "" + aPawnSpotted.id, aPawnSpotted);
    						$$invalidate(1, key = aPawnSpotted.p + "" + aPawnSpotted.id);
    						console.table("PAWN onboard!", "", "owner:", aPawnSpotted.p, "", "id:", aPawnSpotted.id, "", "loc:", aPawnSpotted.loc, "");

    						//Paw = aPawnSpotted;
    						break;
    					}
    				}
    			}
    		}
    	};

    	return [aPawnSpotted, key, send, receive, col, loc];
    }

    class Pawn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { col: 4, loc: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pawn",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*col*/ ctx[4] === undefined && !("col" in props)) {
    			console_1.warn("<Pawn> was created without expected prop 'col'");
    		}

    		if (/*loc*/ ctx[5] === undefined && !("loc" in props)) {
    			console_1.warn("<Pawn> was created without expected prop 'loc'");
    		}
    	}

    	get col() {
    		throw new Error("<Pawn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set col(value) {
    		throw new Error("<Pawn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loc() {
    		throw new Error("<Pawn>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loc(value) {
    		throw new Error("<Pawn>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ScoreBoard.svelte generated by Svelte v3.24.0 */
    const file$1 = "src/ScoreBoard.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*points*/ ctx[1]);
    			attr_dev(div, "class", "scoreboard");
    			attr_dev(div, "data-owner", /*owner*/ ctx[0]);
    			add_location(div, file$1, 19, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*points*/ 2) set_data_dev(t, /*points*/ ctx[1]);

    			if (dirty & /*owner*/ 1) {
    				attr_dev(div, "data-owner", /*owner*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $pawns;
    	let $game;
    	let $gameState;
    	validate_store(pawns, "pawns");
    	component_subscribe($$self, pawns, $$value => $$invalidate(5, $pawns = $$value));
    	validate_store(game, "game");
    	component_subscribe($$self, game, $$value => $$invalidate(6, $game = $$value));
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(7, $gameState = $$value));
    	let { col } = $$props;
    	let owner, ownerID, points;
    	ownerID = col === 0 ? 0 : 1;
    	owner = ownerID + 1;
    	let filtArr;
    	const writable_props = ["col"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ScoreBoard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ScoreBoard", $$slots, []);

    	$$self.$set = $$props => {
    		if ("col" in $$props) $$invalidate(2, col = $$props.col);
    	};

    	$$self.$capture_state = () => ({
    		game,
    		gameState,
    		board,
    		pawns,
    		col,
    		owner,
    		ownerID,
    		points,
    		filtArr,
    		$pawns,
    		$game,
    		$gameState
    	});

    	$$self.$inject_state = $$props => {
    		if ("col" in $$props) $$invalidate(2, col = $$props.col);
    		if ("owner" in $$props) $$invalidate(0, owner = $$props.owner);
    		if ("ownerID" in $$props) $$invalidate(3, ownerID = $$props.ownerID);
    		if ("points" in $$props) $$invalidate(1, points = $$props.points);
    		if ("filtArr" in $$props) $$invalidate(4, filtArr = $$props.filtArr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$pawns, ownerID, filtArr, points*/ 58) {
    			 {
    				$$invalidate(4, filtArr = $pawns[ownerID].filter(e => e.loc === 15));
    				$$invalidate(1, points = filtArr.length);
    				set_store_value(game, $game.points[ownerID] = points, $game);
    			}
    		}

    		if ($$self.$$.dirty & /*$game, ownerID, owner*/ 73) {
    			 {
    				if ($game.points[ownerID] === 7) {
    					set_store_value(game, $game.won = owner, $game);
    					set_store_value(gameState, $gameState.status = `<em class="special">Player ${owner} Won!</em>`, $gameState);
    				}
    			}
    		}
    	};

    	return [owner, points, col];
    }

    class ScoreBoard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { col: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScoreBoard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*col*/ ctx[2] === undefined && !("col" in props)) {
    			console.warn("<ScoreBoard> was created without expected prop 'col'");
    		}
    	}

    	get col() {
    		throw new Error("<ScoreBoard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set col(value) {
    		throw new Error("<ScoreBoard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Board.svelte generated by Svelte v3.24.0 */

    const { Object: Object_1, console: console_1$1 } = globals;
    const file$2 = "src/Board.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	child_ctx[21] = i;
    	return child_ctx;
    }

    // (166:6) {#if pawn.loc == 0}
    function create_if_block_3(ctx) {
    	let pawn;
    	let current;

    	pawn = new Pawn({
    			props: { col: 0, loc: 0 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pawn.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pawn, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pawn.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pawn.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pawn, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(166:6) {#if pawn.loc == 0}",
    		ctx
    	});

    	return block;
    }

    // (165:4) {#each $pawns[0] as pawn, i (pawn.id)}
    function create_each_block_3(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*pawn*/ ctx[19].loc == 0 && create_if_block_3(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pawn*/ ctx[19].loc == 0) {
    				if (if_block) {
    					if (dirty & /*$pawns*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(165:4) {#each $pawns[0] as pawn, i (pawn.id)}",
    		ctx
    	});

    	return block;
    }

    // (184:10) {:else}
    function create_else_block(ctx) {
    	let td;
    	let pawn;
    	let t0;
    	let t1_value = /*cell*/ ctx[25][/*iy*/ ctx[24]] + "";
    	let t1;
    	let td_data_col_value;
    	let td_data_row_value;
    	let td_data_order_value;
    	let td_data_celltype_value;
    	let td_class_value;
    	let current;
    	let mounted;
    	let dispose;

    	pawn = new Pawn({
    			props: {
    				col: /*ix*/ ctx[27],
    				loc: /*cell*/ ctx[25][/*iy*/ ctx[24]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(pawn.$$.fragment);
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(td, "data-col", td_data_col_value = /*ix*/ ctx[27]);
    			attr_dev(td, "data-row", td_data_row_value = /*iy*/ ctx[24]);
    			attr_dev(td, "data-order", td_data_order_value = /*cell*/ ctx[25][/*iy*/ ctx[24]]);
    			attr_dev(td, "data-celltype", td_data_celltype_value = /*type*/ ctx[2](/*cell*/ ctx[25][/*iy*/ ctx[24]]));
    			attr_dev(td, "class", td_class_value = /*tdclass*/ ctx[3](/*cell*/ ctx[25][/*iy*/ ctx[24]]));
    			add_location(td, file$2, 184, 12, 6226);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(pawn, td, null);
    			append_dev(td, t0);
    			append_dev(td, t1);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(td, "click", /*click_handler_1*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const pawn_changes = {};
    			if (dirty & /*$board*/ 2) pawn_changes.loc = /*cell*/ ctx[25][/*iy*/ ctx[24]];
    			pawn.$set(pawn_changes);
    			if ((!current || dirty & /*$board*/ 2) && t1_value !== (t1_value = /*cell*/ ctx[25][/*iy*/ ctx[24]] + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*$board*/ 2 && td_data_order_value !== (td_data_order_value = /*cell*/ ctx[25][/*iy*/ ctx[24]])) {
    				attr_dev(td, "data-order", td_data_order_value);
    			}

    			if (!current || dirty & /*$board*/ 2 && td_data_celltype_value !== (td_data_celltype_value = /*type*/ ctx[2](/*cell*/ ctx[25][/*iy*/ ctx[24]]))) {
    				attr_dev(td, "data-celltype", td_data_celltype_value);
    			}

    			if (!current || dirty & /*$board*/ 2 && td_class_value !== (td_class_value = /*tdclass*/ ctx[3](/*cell*/ ctx[25][/*iy*/ ctx[24]]))) {
    				attr_dev(td, "class", td_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pawn.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pawn.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(pawn);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(184:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (182:36) 
    function create_if_block_2(ctx) {
    	let td;

    	const block = {
    		c: function create() {
    			td = element("td");
    			attr_dev(td, "class", "none");
    			add_location(td, file$2, 182, 12, 6176);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(182:36) ",
    		ctx
    	});

    	return block;
    }

    // (178:10) {#if cell[iy] == '15'}
    function create_if_block_1(ctx) {
    	let td;
    	let scoreboard;
    	let current;

    	scoreboard = new ScoreBoard({
    			props: { col: /*ix*/ ctx[27] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			td = element("td");
    			create_component(scoreboard.$$.fragment);
    			attr_dev(td, "class", "none");
    			add_location(td, file$2, 178, 12, 6054);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			mount_component(scoreboard, td, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scoreboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scoreboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			destroy_component(scoreboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(178:10) {#if cell[iy] == '15'}",
    		ctx
    	});

    	return block;
    }

    // (177:8) {#each $board[0].col as cell, ix}
    function create_each_block_2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*cell*/ ctx[25][/*iy*/ ctx[24]] == "15") return 0;
    		if (/*cell*/ ctx[25][/*iy*/ ctx[24]] == "0") return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(177:8) {#each $board[0].col as cell, ix}",
    		ctx
    	});

    	return block;
    }

    // (175:4) {#each $board[0].col[0] as row, iy}
    function create_each_block_1(ctx) {
    	let tr;
    	let t;
    	let current;
    	let each_value_2 = /*$board*/ ctx[1][0].col;
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			tr = element("tr");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			add_location(tr, file$2, 175, 6, 5962);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$board, type, tdclass, move*/ 30) {
    				each_value_2 = /*$board*/ ctx[1][0].col;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(tr, t);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(175:4) {#each $board[0].col[0] as row, iy}",
    		ctx
    	});

    	return block;
    }

    // (205:6) {#if pawn.loc == 0}
    function create_if_block$1(ctx) {
    	let pawn;
    	let current;

    	pawn = new Pawn({
    			props: { col: 2, loc: 0 },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pawn.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pawn, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pawn.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pawn.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pawn, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(205:6) {#if pawn.loc == 0}",
    		ctx
    	});

    	return block;
    }

    // (204:4) {#each $pawns[1] as pawn, i (pawn.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let current;
    	let if_block = /*pawn*/ ctx[19].loc == 0 && create_if_block$1(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pawn*/ ctx[19].loc == 0) {
    				if (if_block) {
    					if (dirty & /*$pawns*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(204:4) {#each $pawns[1] as pawn, i (pawn.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let each_blocks_2 = [];
    	let each0_lookup = new Map();
    	let t0;
    	let table;
    	let t1;
    	let div1;
    	let each_blocks = [];
    	let each2_lookup = new Map();
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_3 = /*$pawns*/ ctx[0][0];
    	validate_each_argument(each_value_3);
    	const get_key = ctx => /*pawn*/ ctx[19].id;
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_2[i] = create_each_block_3(key, child_ctx));
    	}

    	let each_value_1 = /*$board*/ ctx[1][0].col[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*$pawns*/ ctx[0][1];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*pawn*/ ctx[19].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each2_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();
    			table = element("table");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "pawns pawns1");
    			add_location(div0, file$2, 161, 2, 5564);
    			add_location(table, file$2, 172, 2, 5907);
    			attr_dev(div1, "class", "pawns pawns2");
    			add_location(div1, file$2, 200, 2, 6666);
    			attr_dev(div2, "class", "board");
    			add_location(div2, file$2, 160, 0, 5542);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, table);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(div1, "click", /*click_handler_2*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$pawns*/ 1) {
    				const each_value_3 = /*$pawns*/ ctx[0][0];
    				validate_each_argument(each_value_3);
    				group_outros();
    				validate_each_keys(ctx, each_value_3, get_each_context_3, get_key);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key, 1, ctx, each_value_3, each0_lookup, div0, outro_and_destroy_block, create_each_block_3, null, get_each_context_3);
    				check_outros();
    			}

    			if (dirty & /*$board, type, tdclass, move*/ 30) {
    				each_value_1 = /*$board*/ ctx[1][0].col[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(table, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$pawns*/ 1) {
    				const each_value = /*$pawns*/ ctx[0][1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each2_lookup, div1, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			destroy_each(each_blocks_1, detaching);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function isEmpty(obj) {
    	return Object.keys(obj).length === 0;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $gameState;
    	let $pawns;
    	let $board;
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(9, $gameState = $$value));
    	validate_store(pawns, "pawns");
    	component_subscribe($$self, pawns, $$value => $$invalidate(0, $pawns = $$value));
    	validate_store(board, "board");
    	component_subscribe($$self, board, $$value => $$invalidate(1, $board = $$value));

    	const [send, receive] = crossfade({
    		duration: d => Math.sqrt(d * 200),
    		fallback(node, params) {
    			const style = getComputedStyle(node);
    			const transform = style.transform === "none" ? "" : style.transform;

    			return {
    				duration: 600,
    				easing: quintOut,
    				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
    			};
    		}
    	});

    	let content;
    	let residingPawn;

    	const qS = a => {
    		return document.querySelector(a);
    	};

    	const qA = a => {
    		return document.querySelectorAll(a);
    	};

    	let type = function (c) {
    		return c < 5 || 12 < c ? "safe" : "combat";
    	};

    	let tdclass = function (c) {
    		return c === 8 ? "special" : "";
    	};

    	let spotPawn = function (celliy) {
    		return $pawns[0].find(e => e.loc === celliy);
    	};

    	let mayItPlay = function (owner) {
    		return $gameState.rolled == 1 && $gameState.played == 0 && currentPlayer == owner;
    	};

    	let nextTurn = function () {
    		set_store_value(gameState, $gameState = {
    			turn: ($gameState.turn + 1) % 2,
    			rolled: 0,
    			played: 0,
    			round: $gameState.round + 1,
    			status: $gameState.status + "\n...next turn...",
    			dicesArr: [0, 0, 0, 0]
    		});

    		console.log("NEXT TURN");
    	};

    	let move = function (owner, id, thisPawn) {
    		let ownerID = owner - 1;

    		console.log(mayItPlay(owner)
    		? `${owner} may play`
    		: `${owner} may not play`);

    		if (mayItPlay(owner)) {
    			let col;

    			// ###### FIX findIndex -> find ?!?!?!??! ####
    			const index = $pawns[ownerID].findIndex(item => item.id === Number(id));

    			const pawnObj = $pawns[ownerID][index];
    			const orderToGo = pawnObj.loc + $gameState.diceToMove;
    			console.log(orderToGo, owner, pawnObj.id, pawnObj.loc);
    			let found, foundOwn, foundOpponent;
    			let foundBool, foundOwnBool, foundOpponentBool, canMoveBool = true;

    			if (type(orderToGo) === "safe") {
    				col = Number(owner == 1 ? 0 : 2);
    				console.log("check col", col);

    				if (orderToGo === 15) {
    					pawnObj.loc = 15;
    					set_store_value(gameState, $gameState.status = `<em>Player ${owner}'s</em> Pawn <em>${pawnObj.id}</em> made it!.\n1 Point for <em>Player ${owner}!</em>`, $gameState);
    				} else if (orderToGo > 15) {
    					canMoveBool = false;
    					set_store_value(gameState, $gameState.status = `You should land exactly onto the New Home\nIf you can't move otherwise you should <code>Pass</code>`, $gameState);
    				} else if (orderToGo === 0) {
    					set_store_value(gameState, $gameState.status = `This message shouldn't appear. Case is checked in Dice.svelte`, $gameState);
    				} else {
    					found = $pawns[ownerID].find(e => e.loc === orderToGo);
    					foundBool = found !== null && found !== undefined ? true : false;

    					if (foundBool) {
    						set_store_value(gameState, $gameState.status = `<em>Player ${owner}'s </em> own pawn is there. \nIf you can't move otherwise you should <code>Pass</code>`, $gameState);
    					} // DO A COMMON NOT FOUND ⏬
    				}
    			} else {
    				// !!!!!!!!!!!!!!!!!! ITS COMBAT ZONE!!!!!!!!!!!!!!!!!!
    				col = 1;

    				foundOpponent = $pawns[(ownerID + 1) % 2].find(e => e.loc === orderToGo);

    				foundOpponentBool = foundOpponent !== null && foundOpponent !== undefined
    				? true
    				: false;

    				if (foundOpponentBool) {
    					set_store_value(gameState, $gameState.status = `Opponent <em>Player ${(ownerID + 1) % 2 + 1}'s </em> pawn is there.`, $gameState);
    				}

    				foundOwn = $pawns[ownerID].find(e => e.loc === orderToGo);

    				foundOwnBool = foundOwn !== null && foundOwn !== undefined
    				? true
    				: false;

    				if (foundOwnBool) {
    					set_store_value(gameState, $gameState.status += `\n<em>Player ${owner}'s </em> own pawn is there.`, $gameState);
    				}
    			}

    			console.log("that cell", col, orderToGo);

    			// ############## I CAN MOVE FREELY  ##############
    			if (!found && !foundOwn && !foundOpponentBool && canMoveBool) {
    				console.log("MOVING PAWN");
    				set_store_value(gameState, $gameState.status += `\nPlayer <em>${currentPlayer}</em>'s Pawn #<em>${pawnObj.id}</em> moving to square <em>${orderToGo}</em>`, $gameState);

    				if (orderToGo === 8) {
    					set_store_value(gameState, $gameState.status += `\nPawn is now <em>Untouchable</em>!`, $gameState);
    				}

    				set_store_value(pawns, $pawns[ownerID][index].loc = orderToGo, $pawns);
    				set_store_value(gameState, $gameState.played = 1, $gameState);
    				nextTurn();
    			} else if (foundOpponentBool) {
    				if (orderToGo === 8) {
    					set_store_value(
    						gameState,
    						$gameState.status += `\nPlayer <em>${foundOpponent.p}</em>'s Pawn #<em>${foundOpponent.id}</em> is Safe!
Try another move!`,
    						$gameState
    					);
    				} else {
    					set_store_value(gameState, $gameState.status += `Send 'em Home!`, $gameState);
    					set_store_value(gameState, $gameState.status += `\nPlayer <em>${foundOpponent.p}</em>'s Pawn #<em>${foundOpponent.id}</em> going back Home `, $gameState);
    					foundOpponent.loc = 0;
    					set_store_value(pawns, $pawns[ownerID][index].loc = orderToGo, $pawns);
    					set_store_value(gameState, $gameState.played = 1, $gameState);
    					nextTurn();
    				}
    			}
    		} else {
    			//console.log(mayItPlay(owner)? `${owner} may play` : `${owner} may not play`);
    			set_store_value(
    				gameState,
    				$gameState.status += owner !== undefined
    				? `\nit's not Player <em>${owner}</em>'s turn!.`
    				: `\nno pawns there!`,
    				$gameState
    			);
    		} //$gameState.status += `\nit's not your turn!.`;
    		//console.log(`it's not your turn!.`);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Board> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Board", $$slots, []);
    	const click_handler = e => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target);
    	const click_handler_1 = e => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target);
    	const click_handler_2 = e => move(e.target.dataset.owner, e.target.dataset.pawnname, e.target);

    	$$self.$capture_state = () => ({
    		gameState,
    		board,
    		pawns,
    		Pawn,
    		ScoreBoard,
    		fade,
    		quintOut,
    		crossfade,
    		send,
    		receive,
    		content,
    		residingPawn,
    		qS,
    		qA,
    		type,
    		tdclass,
    		spotPawn,
    		mayItPlay,
    		nextTurn,
    		isEmpty,
    		move,
    		currentPlayer,
    		$gameState,
    		$pawns,
    		$board
    	});

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) content = $$props.content;
    		if ("residingPawn" in $$props) residingPawn = $$props.residingPawn;
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("tdclass" in $$props) $$invalidate(3, tdclass = $$props.tdclass);
    		if ("spotPawn" in $$props) spotPawn = $$props.spotPawn;
    		if ("mayItPlay" in $$props) mayItPlay = $$props.mayItPlay;
    		if ("nextTurn" in $$props) nextTurn = $$props.nextTurn;
    		if ("move" in $$props) $$invalidate(4, move = $$props.move);
    		if ("currentPlayer" in $$props) currentPlayer = $$props.currentPlayer;
    	};

    	let currentPlayer;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameState*/ 512) {
    			 currentPlayer = $gameState.turn + 1;
    		}
    	};

    	return [
    		$pawns,
    		$board,
    		type,
    		tdclass,
    		move,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Board extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Board",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Dices.svelte generated by Svelte v3.24.0 */

    const file$3 = "src/Dices.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (6:0) {#each dicesArr as dice}
    function create_each_block$1(ctx) {
    	let span;
    	let t_value = /*dice*/ ctx[1] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$3, 6, 2, 87);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dicesArr*/ 1 && t_value !== (t_value = /*dice*/ ctx[1] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(6:0) {#each dicesArr as dice}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_value = /*dicesArr*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(div, file$3, 4, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dicesArr*/ 1) {
    				each_value = /*dicesArr*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { dicesArr = [0, 0, 0, 0] } = $$props;
    	const writable_props = ["dicesArr"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dices> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dices", $$slots, []);

    	$$self.$set = $$props => {
    		if ("dicesArr" in $$props) $$invalidate(0, dicesArr = $$props.dicesArr);
    	};

    	$$self.$capture_state = () => ({ dicesArr });

    	$$self.$inject_state = $$props => {
    		if ("dicesArr" in $$props) $$invalidate(0, dicesArr = $$props.dicesArr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dicesArr];
    }

    class Dices extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { dicesArr: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dices",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get dicesArr() {
    		throw new Error("<Dices>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dicesArr(value) {
    		throw new Error("<Dices>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class random {

    	constructor () {
    		this.crypto = (typeof window.crypto.getRandomValues === 'function');
    	
    		this.intMin = Number.MIN_VALUE;
    		this.intMax = Number.MAX_VALUE;
    	}	
    	
    	random () {
    		if (this.crypto) {
    			return window.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
    		}

    		return Math.random();
    	}

    	bool () {
    		return this.random() < 0.5;
    	}

    	int (from, to) {
    		return this.randinterval(from, to, true);
    	}
    	
    	float (from, to) {
    		return from + ((to - from) * this.random());
    	}
    	
    	string (length, charactersToUse) {
    		let str = "";
    		for (let i = 0; i < length; i++) {
    			str += charactersToUse.charAt(this.int(0, charactersToUse.length - 1));
    		}
    		return str;
    	}

    	pick (arr) {
    		return arr[this.int(0, arr.length - 1)];
    	}
    	
    	chance (n) {
    		return this.float(0, 100) < n;
    	}

    	challenge (lower, upper, value) {
    		let span = upper - lower;

    		let chance = (value-lower)/(span/100);
    		if (chance <= 0) chance = 0;
    		if (chance >= 100) chance = 100;

    		return this.chance(chance);
    	}

    	shuffle (arr) {
    		let tmp, j, i = arr.length;
    		while (--i > 0) {
    			j = this.int(0, i);
    			tmp = arr[i];
    			arr[i] = arr[j];
    			arr[j] = tmp;
    		}
    		
    		return arr;
    	}

    	/* usage .weighted(['a', 'b'], [100, 1]); picks one of the options, with odds applied */
    	weighted (options, odds) {
            if (options.length !== odds.length) {
                throw new RangeError("Chance: Length of array and odds must match");
            }

            let sum = 0;
            let val;
            for (let weightIndex = 0; weightIndex < odds.length; ++weightIndex) {
                val = odds[weightIndex];
                if (isNaN(val)) {
                    throw new RangeError("Chance: All weights must be numbers");
                }

                if (val > 0) {
                    sum += val;
                }
            }

            if (sum === 0) {
                throw new RangeError("Chance: No valid entries in array odds");
            }

            const selected = this.random() * sum;

            let total = 0;
            let lastGoodIdx = -1;
            let chosenIdx;
            for (let weightIndex = 0; weightIndex < odds.length; ++weightIndex) {
                val = odds[weightIndex];
                total += val;
                if (val > 0) {
                    if (selected <= total) {
                        chosenIdx = weightIndex;
                        break;
                    }
                    lastGoodIdx = weightIndex;
                }

                if (weightIndex === (odds.length - 1)) {
                    chosenIdx = lastGoodIdx;
                }
            }

            return options[chosenIdx];
        }
    	
    	randinterval (min, max, includeMax) {
    		
    		if (min == max) return min;
    		if (max < min) return this.randinterval(max, min, includeMax);
    		if (min < 0 || max < 1) {
    			return this.rand((max - min) + (includeMax ? 1 : 0)) + min;
    		}
    		return min + this.rand(max - min + (includeMax ? 1 : 0));
    	}

    	rand (n) {
    		if (n <= 0 || n > this.intMax) {
    			console.error("n out of (0, INT_MAX]");
    		}
    		
    		return Math.floor(this.random() * n);
    	}
    }

    /* src/Dice.svelte generated by Svelte v3.24.0 */

    const { console: console_1$2 } = globals;
    const file$4 = "src/Dice.svelte";

    // (118:2) {#if (!Boolean($gameState.played) && Boolean($gameState.rolled))}
    function create_if_block_1$1(ctx) {
    	let pre;
    	let t0;
    	let em;
    	let t1_value = /*$gameState*/ ctx[2].diceToMove + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			pre = element("pre");
    			t0 = text("it's a ");
    			em = element("em");
    			t1 = text(t1_value);
    			t2 = text("!");
    			add_location(em, file$4, 117, 79, 3252);
    			add_location(pre, file$4, 117, 67, 3240);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, pre, anchor);
    			append_dev(pre, t0);
    			append_dev(pre, em);
    			append_dev(em, t1);
    			append_dev(pre, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$gameState*/ 4 && t1_value !== (t1_value = /*$gameState*/ ctx[2].diceToMove + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(pre);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(118:2) {#if (!Boolean($gameState.played) && Boolean($gameState.rolled))}",
    		ctx
    	});

    	return block;
    }

    // (123:2) {:else}
    function create_else_block$1(ctx) {
    	let button0;
    	let t1;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button0 = element("button");
    			button0.textContent = "ROLL";
    			t1 = space();
    			button1 = element("button");
    			button1.textContent = "PASS";
    			add_location(button0, file$4, 123, 2, 3402);
    			add_location(button1, file$4, 124, 2, 3442);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button1, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*roll*/ ctx[5], false, false, false),
    					listen_dev(
    						button1,
    						"click",
    						function () {
    							if (is_function(/*nextTurn*/ ctx[0])) /*nextTurn*/ ctx[0].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(123:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (121:2) {#if $game.won}
    function create_if_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "RESTART";
    			add_location(button, file$4, 121, 2, 3346);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*restart*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(121:2) {#if $game.won}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div0;
    	let pre;
    	let t0;
    	let em0;
    	let t1_value = /*$gameState*/ ctx[2].round + "";
    	let t1;
    	let t2;
    	let em1;
    	let t3;
    	let t4;
    	let html_tag;

    	let raw0_value = (!!/*$gameState*/ ctx[2].rolled
    	? `<em>Player ${/*currentPlayer*/ ctx[1]}</em> rolled the Dices`
    	: `<em>Player ${/*currentPlayer*/ ctx[1]}</em> haven't rolled yet.`) + "";

    	let t5;
    	let html_tag_1;

    	let raw1_value = (!/*$gameState*/ ctx[2].played && !!/*$gameState*/ ctx[2].rolled
    	? `Waiting for <em>Player ${/*currentPlayer*/ ctx[1]}</em> to play`
    	: ``) + "";

    	let t6;
    	let html_tag_2;
    	let raw2_value = /*$gameState*/ ctx[2].status + "";
    	let t7;
    	let div1;
    	let dices;
    	let t8;
    	let show_if = !Boolean(/*$gameState*/ ctx[2].played) && Boolean(/*$gameState*/ ctx[2].rolled);
    	let t9;
    	let div2;
    	let current;

    	dices = new Dices({
    			props: { dicesArr: /*$gameState*/ ctx[2].dicesArr },
    			$$inline: true
    		});

    	let if_block0 = show_if && create_if_block_1$1(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*$game*/ ctx[3].won) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			pre = element("pre");
    			t0 = text("Round: ");
    			em0 = element("em");
    			t1 = text(t1_value);
    			t2 = text("\nit's Player ");
    			em1 = element("em");
    			t3 = text(/*currentPlayer*/ ctx[1]);
    			t4 = text("'s turn\n\n");
    			t5 = text("\n");
    			t6 = text("\n\n");
    			t7 = space();
    			div1 = element("div");
    			create_component(dices.$$.fragment);
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			div2 = element("div");
    			if_block1.c();
    			add_location(em0, file$4, 104, 7, 2554);
    			add_location(em1, file$4, 105, 12, 2594);
    			html_tag = new HtmlTag(t5);
    			html_tag_1 = new HtmlTag(t6);
    			html_tag_2 = new HtmlTag(null);
    			add_location(pre, file$4, 103, 2, 2541);
    			attr_dev(div0, "class", "status");
    			add_location(div0, file$4, 102, 0, 2518);
    			attr_dev(div1, "class", "dices");
    			add_location(div1, file$4, 114, 0, 3105);
    			attr_dev(div2, "class", "command");
    			add_location(div2, file$4, 119, 0, 3304);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, pre);
    			append_dev(pre, t0);
    			append_dev(pre, em0);
    			append_dev(em0, t1);
    			append_dev(pre, t2);
    			append_dev(pre, em1);
    			append_dev(em1, t3);
    			append_dev(pre, t4);
    			html_tag.m(raw0_value, pre);
    			append_dev(pre, t5);
    			html_tag_1.m(raw1_value, pre);
    			append_dev(pre, t6);
    			html_tag_2.m(raw2_value, pre);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(dices, div1, null);
    			append_dev(div1, t8);
    			if (if_block0) if_block0.m(div1, null);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div2, anchor);
    			if_block1.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$gameState*/ 4) && t1_value !== (t1_value = /*$gameState*/ ctx[2].round + "")) set_data_dev(t1, t1_value);
    			if (!current || dirty & /*currentPlayer*/ 2) set_data_dev(t3, /*currentPlayer*/ ctx[1]);

    			if ((!current || dirty & /*$gameState, currentPlayer*/ 6) && raw0_value !== (raw0_value = (!!/*$gameState*/ ctx[2].rolled
    			? `<em>Player ${/*currentPlayer*/ ctx[1]}</em> rolled the Dices`
    			: `<em>Player ${/*currentPlayer*/ ctx[1]}</em> haven't rolled yet.`) + "")) html_tag.p(raw0_value);

    			if ((!current || dirty & /*$gameState, currentPlayer*/ 6) && raw1_value !== (raw1_value = (!/*$gameState*/ ctx[2].played && !!/*$gameState*/ ctx[2].rolled
    			? `Waiting for <em>Player ${/*currentPlayer*/ ctx[1]}</em> to play`
    			: ``) + "")) html_tag_1.p(raw1_value);

    			if ((!current || dirty & /*$gameState*/ 4) && raw2_value !== (raw2_value = /*$gameState*/ ctx[2].status + "")) html_tag_2.p(raw2_value);
    			const dices_changes = {};
    			if (dirty & /*$gameState*/ 4) dices_changes.dicesArr = /*$gameState*/ ctx[2].dicesArr;
    			dices.$set(dices_changes);
    			if (dirty & /*$gameState*/ 4) show_if = !Boolean(/*$gameState*/ ctx[2].played) && Boolean(/*$gameState*/ ctx[2].rolled);

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dices.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dices.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div1);
    			destroy_component(dices);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div2);
    			if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $gameState;
    	let $pawns;
    	let $game;
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(2, $gameState = $$value));
    	validate_store(pawns, "pawns");
    	component_subscribe($$self, pawns, $$value => $$invalidate(7, $pawns = $$value));
    	validate_store(game, "game");
    	component_subscribe($$self, game, $$value => $$invalidate(3, $game = $$value));
    	let rnd = new random();
    	let newBool = rnd.bool();

    	let rollAdice = () => {
    		return rnd.int(0, 1);
    	};

    	let { rollAll = function () {
    		return [rollAdice(), rollAdice(), rollAdice(), rollAdice()];
    	} } = $$props;

    	let { nextTurn = function () {
    		set_store_value(gameState, $gameState = {
    			turn: ($gameState.turn + 1) % 2,
    			rolled: 0,
    			played: 0,
    			round: $gameState.round + 1,
    			status: $gameState.status + "\n...next turn...",
    			dicesArr: [0, 0, 0, 0]
    		});

    		console.log("NEXT TURN");
    	} } = $$props;

    	let restart = function () {
    		set_store_value(pawns, $pawns = [
    			[
    				{ loc: 0, p: 1, id: 1 },
    				{ loc: 0, p: 1, id: 2 },
    				{ loc: 0, p: 1, id: 3 },
    				{ loc: 0, p: 1, id: 4 },
    				{ loc: 0, p: 1, id: 5 },
    				{ loc: 0, p: 1, id: 6 },
    				{ loc: 0, p: 1, id: 7 }
    			],
    			[
    				{ loc: 0, p: 2, id: 1 },
    				{ loc: 0, p: 2, id: 2 },
    				{ loc: 0, p: 2, id: 3 },
    				{ loc: 0, p: 2, id: 4 },
    				{ loc: 0, p: 2, id: 5 },
    				{ loc: 0, p: 2, id: 6 },
    				{ loc: 0, p: 2, id: 7 }
    			]
    		]);

    		set_store_value(gameState, $gameState = {
    			round: 1,
    			turn: 0,
    			status: "",
    			dicesArr: [0, 0, 0, 0]
    		});

    		set_store_value(game, $game = { points: [], won: null });
    	};

    	const sum = (accumulator, currentValue) => accumulator + currentValue;
    	let rolled = 0;
    	let played = 0;
    	let currentPlayer;
    	set_store_value(gameState, $gameState.dicesArr = [0, 0, 0, 0], $gameState);
    	set_store_value(gameState, $gameState.diceToMove = $gameState.dicesArr.reduce(sum), $gameState);
    	set_store_value(gameState, $gameState.rolled = rolled, $gameState);
    	set_store_value(gameState, $gameState.played = played, $gameState);

    	let canitRoll = function () {
    		return $gameState.rolled == 0 && $gameState.played == 0;
    	};

    	let roll = function () {
    		console.log($gameState.rolled, $gameState.played, canitRoll());

    		if (canitRoll()) {
    			//roll
    			set_store_value(gameState, $gameState.dicesArr = rollAll(), $gameState);

    			set_store_value(gameState, $gameState.diceToMove = $gameState.dicesArr.reduce(sum), $gameState);
    			set_store_value(gameState, $gameState.rolled = 1, $gameState);

    			//$gameState.turn = ($gameState.turn+1) %2;
    			set_store_value(gameState, $gameState.status = `\nPlayer <em>${currentPlayer}</em> just rolled: <em>${$gameState.diceToMove}</em>`, $gameState);

    			if ($gameState.diceToMove === 0) {
    				//$gameState.status += "rolled a 0...";
    				nextTurn();
    			}
    		} else {
    			set_store_value(gameState, $gameState.status += `\nDice is already rolled, you can not roll again.`, $gameState);
    		}
    	}; //console.log("sasdfsad");

    	const writable_props = ["rollAll", "nextTurn"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Dice> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dice", $$slots, []);

    	$$self.$set = $$props => {
    		if ("rollAll" in $$props) $$invalidate(6, rollAll = $$props.rollAll);
    		if ("nextTurn" in $$props) $$invalidate(0, nextTurn = $$props.nextTurn);
    	};

    	$$self.$capture_state = () => ({
    		gameState,
    		game,
    		pawns,
    		Dices,
    		random,
    		rnd,
    		newBool,
    		rollAdice,
    		rollAll,
    		nextTurn,
    		restart,
    		sum,
    		rolled,
    		played,
    		currentPlayer,
    		canitRoll,
    		roll,
    		$gameState,
    		$pawns,
    		$game
    	});

    	$$self.$inject_state = $$props => {
    		if ("rnd" in $$props) rnd = $$props.rnd;
    		if ("newBool" in $$props) newBool = $$props.newBool;
    		if ("rollAdice" in $$props) rollAdice = $$props.rollAdice;
    		if ("rollAll" in $$props) $$invalidate(6, rollAll = $$props.rollAll);
    		if ("nextTurn" in $$props) $$invalidate(0, nextTurn = $$props.nextTurn);
    		if ("restart" in $$props) $$invalidate(4, restart = $$props.restart);
    		if ("rolled" in $$props) rolled = $$props.rolled;
    		if ("played" in $$props) played = $$props.played;
    		if ("currentPlayer" in $$props) $$invalidate(1, currentPlayer = $$props.currentPlayer);
    		if ("canitRoll" in $$props) canitRoll = $$props.canitRoll;
    		if ("roll" in $$props) $$invalidate(5, roll = $$props.roll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameState*/ 4) {
    			 $$invalidate(1, currentPlayer = $gameState.turn + 1);
    		}
    	};

    	return [nextTurn, currentPlayer, $gameState, $game, restart, roll, rollAll];
    }

    class Dice extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { rollAll: 6, nextTurn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dice",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get rollAll() {
    		throw new Error("<Dice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rollAll(value) {
    		throw new Error("<Dice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextTurn() {
    		throw new Error("<Dice>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nextTurn(value) {
    		throw new Error("<Dice>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.0 */

    const { console: console_1$3 } = globals;
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let p;
    	let t0;
    	let board_1;
    	let t1;
    	let dice;
    	let current;
    	board_1 = new Board({ $$inline: true });
    	dice = new Dice({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			p = element("p");
    			t0 = space();
    			create_component(board_1.$$.fragment);
    			t1 = space();
    			create_component(dice.$$.fragment);
    			add_location(p, file$5, 38, 2, 641);
    			attr_dev(main, "class", "svelte-1fjybpv");
    			add_location(main, file$5, 36, 0, 631);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(main, t0);
    			mount_component(board_1, main, null);
    			append_dev(main, t1);
    			mount_component(dice, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(board_1.$$.fragment, local);
    			transition_in(dice.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(board_1.$$.fragment, local);
    			transition_out(dice.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(board_1);
    			destroy_component(dice);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $gameState;
    	let $pawns;
    	let $game;
    	validate_store(gameState, "gameState");
    	component_subscribe($$self, gameState, $$value => $$invalidate(0, $gameState = $$value));
    	validate_store(pawns, "pawns");
    	component_subscribe($$self, pawns, $$value => $$invalidate(1, $pawns = $$value));
    	validate_store(game, "game");
    	component_subscribe($$self, game, $$value => $$invalidate(2, $game = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Board,
    		Dice,
    		gameState,
    		pawns,
    		board,
    		game,
    		$gameState,
    		$pawns,
    		$game
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$gameState*/ 1) {
    			//console.clear();
    			 console.log("gamestate:", $gameState);
    		}

    		if ($$self.$$.dirty & /*$pawns*/ 2) {
    			 console.log("pawns:", $pawns);
    		}

    		if ($$self.$$.dirty & /*$game*/ 4) {
    			//$: console.log("board:",$board);
    			 console.log("game", $game);
    		}
    	};

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		//name: "hey"
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
