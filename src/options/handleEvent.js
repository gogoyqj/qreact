import ReactEventBridge from '../event/ReactEventBridge';

let event = function () {
    ReactEventBridge.bridge.apply(null, arguments);
};

export default event;
