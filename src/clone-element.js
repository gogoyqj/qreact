import { extend } from './util';
import { h } from './h';

export function cloneElement(vnode, props) {
    return h(
        vnode.type,
        extend(extend({}, vnode.props), props),
        arguments.length>2 ? [].slice.call(arguments, 2) : vnode.children
    );
}
