/**
 * inject react original event
 */
import ReactEventBridge from './event/ReactEventBridge';
import handleEvent from './options/handleEvent';
import options from './options';

/* global internalInstanceKey:false */

function getInternalInstanceKey() {
    if (typeof internalInstanceKey !== 'undefined') {
        return internalInstanceKey;
    }
}

options.loseUp = function(inst, node) {
    let key = getInternalInstanceKey();
    // @for fucking typeof null === 'object'
    if (key && typeof inst === 'object' && inst !== null) {
        ReactEventBridge.precacheNode(inst, node);
    }
};

options.recycle = function(node) {
    let key = getInternalInstanceKey();
    if (node[key]) {
        ReactEventBridge.recycle(node, key);
    }
};


options.handleEvent = handleEvent;
