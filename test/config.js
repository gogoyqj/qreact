import { config }  from 'karma-event-driver-ext/cjs/event-driver-hooks';
let host = '127.0.0.1';
config({
    host,
    port: 8848
});

export {
    host
};
