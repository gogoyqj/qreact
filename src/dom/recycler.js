/**
 * @description remove node only, won't recycle
 */

import { removeNode } from './index';

export function collectNode(node) {
    removeNode(node);

    if ('_component' in node/*node instanceof Element*/) {
        node._component = node._componentConstructor = null;
    }
}


export function createNode(nodeName, isSvg) {
    let name = nodeName.toLowerCase(),
        node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
    node.normalizedNodeName = name;
    return node;
}

// use comment node replace null
const placeHolder = 'qreact empty';

export function createComment() {
    return document.createComment(placeHolder);
}


export function isComment(node) {
    return node && node.nodeType === 8 && node.nodeValue === placeHolder;
}
