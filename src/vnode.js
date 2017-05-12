/** Virtual DOM Node */
export function VNode(nodeName, attributes, children) {
    /** @type {string|function} */
    this.nodeName = nodeName;

    /** @type {object<string>|undefined} */
    this.attributes = attributes;

    /** @type {array<VNode>|undefined} */
    while (Array.isArray(children) && children.length == 1) {
        children = children[0];
    };
    if (children != null) this.children = children;

    /** Reference to the given key. */
    this.key = attributes && attributes.key;
}
