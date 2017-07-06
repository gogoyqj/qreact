/**
 * used to simulate react-dom/lib/ReactBrowserEventEmitter
 * but only for yo-router
 */
var qreact = require('qreact');

module.exports = qreact.EventEmitter = { 
    ReactEventListener: {
        dispatchEvent: function(name, e) {
            var target = e.target,
                type = e.type;
            var isTouch = type.match(/touch/gi);
            var eType = isTouch ? 'UIEvent' : 'MouseEvent';
            var evt = document.createEvent(eType);
            evt['init' + eType](type, true, true);
            for (var key in e) {
                evt[key] = e[key];
            }
            if (evt.touches) evt.targetTouches = evt.touches;
            target.dispatchEvent(evt);
        }
    }
};
