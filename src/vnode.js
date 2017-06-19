/** Virtual DOM Node */
export function VNode(nodeName, attributes, children) {
    /** @type {string|function} */
    this.type = nodeName;

    /** @type {object<string>|undefined} */
    // m-start
    this.props = attributes;
    // m-end

    /** @type {array<VNode>|undefined} */
    
    if (children != null) this.children = children;

    /** Reference to the given key. */
    this.key = attributes && attributes.key;
}
