// polly fill
import _assign from 'object-assign';
Object.assign = Object.assign || _assign;
import { PropTypes } from './proptypes';
import { h } from './h';
import { Component as PreactComponent } from './component';
import { render as preactRender } from './render';
import options from './options';
import { extend } from './util';


const version = '15.1.0'; // trick libraries to think we are react

const ELEMENTS = 'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan'.split(' ');

const REACT_ELEMENT_TYPE = (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) || 0xeac7;

const COMPONENT_WRAPPER_KEY = typeof Symbol !== 'undefined' ? Symbol.for('__preactCompatWrapper') : '__preactCompatWrapper';

// don't autobind these methods since they already have guaranteed context.
const AUTOBIND_BLACKLIST = {
    constructor: 1,
    render: 1,
    shouldComponentUpdate: 1,
    componentWillReceiveProps: 1,
    componentWillUpdate: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1
};


const CAMEL_PROPS = /^(?:accent|alignment|arabic|baseline|cap|clip|color|fill|flood|font|glyph|horiz|marker|overline|paint|stop|strikethrough|stroke|text|underline|unicode|units|v|vert|word|writing|x)[A-Z]/;


const BYPASS_HOOK = {};

// a component that renders nothing. Used to replace components for unmountComponentAtNode.
const EmptyComponent = () => null;




let VNode = h('').constructor;
VNode.prototype.$$typeof = REACT_ELEMENT_TYPE;
VNode.prototype.preactCompatUpgraded = false;
VNode.prototype.preactCompatNormalized = false;
Object.defineProperty(VNode.prototype, 'type', {
    get() { return this.nodeName; },
    set(v) { this.nodeName = v; },
    configurable: true
});

Object.defineProperty(VNode.prototype, 'props', {
    get() { return this.attributes; },
    set(v) { this.attributes = v; },
    configurable: true
});



let oldEventHook = options.event;
options.event = e => {
    e.persist = Object;
    if (oldEventHook) e = oldEventHook(e);
    return e;
};

let oldVnodeHook = options.vnode;
options.vnode = vnode => {
    if (!vnode.preactCompatUpgraded) {
        vnode.preactCompatUpgraded = true;

        let tag = vnode.nodeName,
            attrs = vnode.attributes = extend({}, vnode.attributes);

        // children: arr length > 1 or object
        if (vnode.children) attrs.children = vnode.children;

        if (typeof tag === 'function') {
            if (tag[COMPONENT_WRAPPER_KEY] === true || (tag.prototype && 'isReactComponent' in tag.prototype)) {
                if (!vnode.preactCompatNormalized) {
                    normalizeVNode(vnode);
                }
                handleComponentVNode(vnode);
            }
        } else if (attrs) {
            handleElementVNode(vnode, attrs);
        }
    }
    if (oldVnodeHook) oldVnodeHook(vnode);
};

function handleComponentVNode(vnode) {
    let tag = vnode.nodeName,
        a = vnode.attributes;

    vnode.attributes = {};
    if (tag.defaultProps) extend(vnode.attributes, tag.defaultProps);
    if (a) extend(vnode.attributes, a);
}

function handleElementVNode(vnode, a) {
    let shouldSanitize, attrs, i;
    if (a) {
        for (i in a)
            if ((shouldSanitize = CAMEL_PROPS.test(i))) break;
        if (shouldSanitize) {
            attrs = vnode.attributes = {};
            for (i in a) {
                if (a.hasOwnProperty(i)) {
                    attrs[CAMEL_PROPS.test(i) ? i.replace(/([A-Z0-9])/, '-$1').toLowerCase() : i] = a[i];
                }
            }
        }
    }
}



// proxy render() since React returns a Component reference.
function render(vnode, parent, callback) {
    let prev = parent && parent._preactCompatRendered && parent._preactCompatRendered.base;

    // ignore impossible previous renders
    if (prev && prev.parentNode !== parent) prev = null;

    let out = preactRender(vnode, parent, prev);
    if (parent) parent._preactCompatRendered = out && (out._component || { base: out });
    if (typeof callback === 'function') callback();
    return out && out._component || out;
}


class ContextProvider {
    getChildContext() {
        return this.props.context;
    }
    render(props) {
        return props.children[0];
    }
}

function renderSubtreeIntoContainer(parentComponent, vnode, container, callback) {
    let wrap = h(ContextProvider, { context: parentComponent.context }, vnode);
    let c = render(wrap, container);
    if (callback) callback(c);
    return c;
}


function unmountComponentAtNode(container) {
    let existing = container._preactCompatRendered && container._preactCompatRendered.base;
    if (existing && existing.parentNode === container) {
        preactRender(h(EmptyComponent), container, existing);
        return true;
    }
    return false;
}



const ARR = [];

// This API is completely unnecessary for Preact, so it's basically passthrough.
let Children = {
    map(children, fn, ctx) {
        if (children == null) return null;
        children = Children.toArray(children);
        if (ctx && ctx !== children) fn = fn.bind(ctx);
        return children.map(fn);
    },
    forEach(children, fn, ctx) {
        if (children == null) return null;
        children = Children.toArray(children);
        if (ctx && ctx !== children) fn = fn.bind(ctx);
        children.forEach(fn);
    },
    count(children) {
        return children && children.length || 0;
    },
    only(children) {
        children = Children.toArray(children);
        if (children.length !== 1) throw new Error('Children.only() expects only one child.');
        return children[0];
    },
    toArray(children) {
        return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
    }
};


/** Track current render() component for ref assignment */
let currentComponent;


function createFactory(type) {
    return createElement.bind(null, type);
}


let DOM = {};
for (let i = ELEMENTS.length; i--;) {
    DOM[ELEMENTS[i]] = createFactory(ELEMENTS[i]);
}

function upgradeToVNodes(arr, offset) {
    for (let i = offset || 0; i < arr.length; i++) {
        let obj = arr[i];
        if (Array.isArray(obj)) {
            upgradeToVNodes(obj);
        } else if (obj && typeof obj === 'object' && !isValidElement(obj) && ((obj.props && obj.type) || (obj.attributes && obj.nodeName) || obj.children)) {
            arr[i] = createElement(obj.type || obj.nodeName, obj.props || obj.attributes, obj.children);
        }
    }
}

function isStatelessComponent(c) {
    return typeof c === 'function' && !(c.prototype && c.prototype.render);
}

// wraps stateless functional components in a PropTypes validator
function wrapStatelessComponent(WrappedComponent) {
    return createClass({
        displayName: WrappedComponent.displayName || WrappedComponent.name,
        render(props, state, context) {
            return WrappedComponent(props, context);
        }
    });
}


function statelessComponentHook(Ctor) {
    let Wrapped = Ctor[COMPONENT_WRAPPER_KEY];
    if (Wrapped) return Wrapped === true ? Ctor : Wrapped;

    Wrapped = wrapStatelessComponent(Ctor);

    Object.defineProperty(Wrapped, COMPONENT_WRAPPER_KEY, { configurable: true, value: true });
    Wrapped.displayName = Ctor.displayName;
    Wrapped.propTypes = Ctor.propTypes;
    Wrapped.defaultProps = Ctor.defaultProps;

    Object.defineProperty(Ctor, COMPONENT_WRAPPER_KEY, { configurable: true, value: Wrapped });

    return Wrapped;
}


function createElement(...args) {
    upgradeToVNodes(args, 2);
    return normalizeVNode(h(...args));
}


function normalizeVNode(vnode) {
    vnode.preactCompatNormalized = true;

    applyClassName(vnode);

    if (isStatelessComponent(vnode.nodeName)) {
        vnode.nodeName = statelessComponentHook(vnode.nodeName);
    }

    let ref = vnode.attributes.ref,
        type = ref && typeof ref;
    if (currentComponent && (type === 'string' || type === 'number')) {
        vnode.attributes.ref = createStringRefProxy(ref, currentComponent);
    }

    // since using origin react event, applyEventNormalization become useless
    // applyEventNormalization(vnode);

    return vnode;
}

// 不使用外面的cloneElement,使用这里的
function cloneElement(element, props = {}) {
    if (!isValidElement(element)) return element;
    let elementProps = element.attributes || element.props || {};
    let newProps = extend(extend({}, elementProps), props);
    let c;
    if (arguments.length > 2) {
        c = [].slice.call(arguments, 2);
    } else {
        c = element.children || props.children;
        if (!Array.isArray(c)) {
            c = [c];
        }
    }

    let node = h(
        element.nodeName || element.type,
        newProps,
        c
    );
    return normalizeVNode(node);
}




function isValidElement(element) {
    return element && ((element instanceof VNode) || element.$$typeof === REACT_ELEMENT_TYPE);
}


function createStringRefProxy(name, component) {
    component.__refs[name] = '';
    return component._refProxies[name] || (component._refProxies[name] = resolved => {
        if (component && component.refs) {
            // while normalizeVNode ，已经确定了所有的 ref, 在此 map 内 不可 null
            if ((name in component.__refs) && resolved === null) return;
            component.refs[name] = resolved;
            if (resolved === null) {
                delete component._refProxies[name];
                component = null;
            }
        }
    });
}


// function applyEventNormalization({ nodeName, attributes }) {
//     if (!attributes || typeof nodeName !== 'string') return;
//     let props = {};
//     for (let i in attributes) {
//         props[i.toLowerCase()] = i;
//     }
//     if (props.ondoubleclick) {
//         attributes.ondblclick = attributes[props.ondoubleclick];
//         delete attributes[props.ondoubleclick];
//     }
//     if (props.onchange) {
//         nodeName = nodeName.toLowerCase();
//         let attr = nodeName === 'input' && String(attributes.type).toLowerCase() === 'checkbox' ? 'onclick' : 'oninput',
//             normalized = props[attr] || attr;
//         if (!attributes[normalized]) {
//             attributes[normalized] = multihook([attributes[props[attr]], attributes[props.onchange]]);
//             delete attributes[props.onchange];
//         }
//     }
// }


function applyClassName({ attributes }) {
    if (!attributes) return;
    let cl = attributes.className || attributes.class;
    if (cl) attributes.className = cl;
}

function shallowDiffers(a, b) {
    for (let i in a)
        if (!(i in b)) return true;
    for (let i in b)
        if (a[i] !== b[i]) return true;
    return false;
}


let findDOMNode = component => component && component.base || component;


function F() {}

function createClass(obj) {
    function cl(props, context) {
        bindAll(this);
        Component.call(this, props, context, BYPASS_HOOK);
        newComponentHook.call(this, props, context);
    }

    obj = extend({ constructor: cl }, obj);

    // We need to apply mixins here so that getDefaultProps is correctly mixed
    if (obj.mixins) {
        applyMixins(obj, collateMixins(obj.mixins));
    }
    if (obj.statics) {
        extend(cl, obj.statics);
    }
    if (obj.propTypes) {
        cl.propTypes = obj.propTypes;
    }
    if (obj.defaultProps) {
        cl.defaultProps = obj.defaultProps;
    }
    if (obj.getDefaultProps) {
        cl.defaultProps = obj.getDefaultProps();
    }

    F.prototype = Component.prototype;
    cl.prototype = extend(new F(), obj);

    cl.displayName = obj.displayName || 'Component';

    return cl;
}


// Flatten an Array of mixins to a map of method name to mixin implementations
function collateMixins(mixins) {
    let keyed = {};
    for (let i = 0; i < mixins.length; i++) {
        let mixin = mixins[i];
        for (let key in mixin) {
            if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
                (keyed[key] || (keyed[key] = [])).push(mixin[key]);
            }
        }
    }
    return keyed;
}


// apply a mapping of Arrays of mixin methods to a component prototype
function applyMixins(proto, mixins) {
    for (let key in mixins)
        if (mixins.hasOwnProperty(key)) {
            const hooks = proto[key] ? mixins[key].concat(proto[key]) : mixins[key];
            if (
                key === "getDefaultProps" ||
                key === "getInitialState" ||
                key === "getChildContext"
            ) {
                proto[key] = multihook(hooks, mergeNoDupes);
            } else {
                proto[key] = multihook(hooks);
            }
        }
}


function bindAll(ctx) {
    for (let i in ctx) {
        let v = ctx[i];
        if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.hasOwnProperty(i)) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}


function callMethod(ctx, m, args) {
    if (typeof m === 'string') {
        m = ctx.constructor.prototype[m];
    }
    if (typeof m === 'function') {
        return m.apply(ctx, args);
    }
}

function multihook(hooks, mergeFn) {
    return function() {
        let ret;
        for (let i = 0; i < hooks.length; i++) {
            let r = callMethod(this, hooks[i], arguments);

            if (mergeFn) {
                ret = mergeFn(ret, r);
            } else if (typeof r !== 'undefined') ret = r;
        }
        return ret;
    };
}


// Used for lifecycle hooks like getInitialState to merge the return values
function mergeNoDupes(previous, current) {
    if (current != null) {
        if (typeof current !== 'object') throw new Error('Expected return value to be an object or null.');
        if (!previous) previous = {};

        for (let key in current)
            if (current.hasOwnProperty(key)) {
                if (previous.hasOwnProperty(key)) throw new Error('Duplicate key "' + key + '" found when merging return value.');
                previous[key] = current[key];
            }
    }
    return previous;
}


function newComponentHook(props, context) {
    propsHook.call(this, props, context);
    this.componentWillReceiveProps = multihook([propsHook, this.componentWillReceiveProps || 'componentWillReceiveProps']);
    this.render = multihook([propsHook, beforeRender, this.render || 'render', afterRender]);
}


function propsHook(props) {
    if (!props) return;

    // React annoyingly special-cases single children, and some react components are ridiculously strict about this.
    let c = props.children;
    if (c && Array.isArray(c) && c.length === 1) {
        props.children = c[0]; // object or arr.length > 1
    }

    // add proptype checking
    // if (DEV) {
    //     let ctor = typeof this === 'function' ? this : this.constructor,
    //         propTypes = this.propTypes || ctor.propTypes;
    //     if (propTypes) {
    //         for (let prop in propTypes) {
    //             if (propTypes.hasOwnProperty(prop) && typeof propTypes[prop] === 'function') {
    //                 const displayName = this.displayName || ctor.name;
    //                 let err = propTypes[prop](props, prop, displayName, 'prop');
    //                 if (err) console.log(err, 'propTypes验证不通过');
    //             }
    //         }
    //     }
    // }
}


function beforeRender() {
    currentComponent = this;
    currentComponent.__refs = {};
}

function afterRender() {
    if (currentComponent === this) {
        currentComponent = null;
    }
}



function Component(props, context, opts) {
    PreactComponent.call(this, props, context);
    this.state = this.getInitialState ? this.getInitialState() : {};
    this.refs = {};
    this._refProxies = {};
    if (opts !== BYPASS_HOOK) {
        newComponentHook.call(this, props, context);
    }
}
Component.prototype = new PreactComponent();
extend(Component.prototype, {
    constructor: Component,

    isReactComponent: {},

    replaceState(state, callback) {
        this.setState(state, callback);
        for (let i in this.state) {
            if (!(i in state)) {
                delete this.state[i];
            }
        }
    },

    getDOMNode() {
        return this.base;
    },

    isMounted() {
        return !!this.base;
    }
});



function PureComponent(props, context) {
    Component.call(this, props, context);
}
PureComponent.prototype = new Component({}, {}, BYPASS_HOOK);
PureComponent.prototype.shouldComponentUpdate = function(props, state) {
    return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};

// better user experience
let qreact = {
    version,
    options, // support devtools
    DOM,
    PropTypes, // actually proptypes target in src/proptypes.js
    Children,
    render,
    createClass,
    createFactory,
    createElement,
    cloneElement,
    isValidElement,
    findDOMNode,
    unmountComponentAtNode,
    Component,
    PureComponent,
    unstable_renderSubtreeIntoContainer: renderSubtreeIntoContainer
};

import ReactDefaultInjection from './event/ReactDefaultInjection';
import ReactAdapter from './lib/ReactAdapter';

ReactAdapter.adapt(qreact);
// extract injectResponderEventPlugin to qreact/lib/injectResponderEventPlugin.js
// 请不要修改下方代码，否则就炒了你
// never modify code below, or u will be fired
// import './event/injectResponderEventPlugin';import ReactWebAdapter from './lib/ReactWebAdapter';ReactWebAdapter.adapt(qreact)
ReactDefaultInjection.inject();

export default qreact;
