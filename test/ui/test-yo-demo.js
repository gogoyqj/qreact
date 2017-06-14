import qreact from 'preact-react-web';
import { expect } from 'chai';
import { browser, beforeHook, afterHook, loadScript }  from 'karma-event-driver-ext/cjs/event-driver-hooks';
import { host } from '../config';
let { $serial } = browser;
let g = (id) => document.getElementById(id);
let react = global.qreact = qreact;
let url = '//' + host + ':8849/examples/yo-demo/prd/';
let pageJS = 'page/component/';
let libJS = 'lib.js';
let cssIdPrefix = 'css-';
let CurrentIndex = 0, pages = 'actionsheet alert calendar carousel carousel/control carousel/personal carousel/usageScenario confirm datetimepicker dialog grouplist index inputnumber lazyimage list list/base list/infinite_mode_with_height list/infinite_mode_without_height list/static_section loading modal multilist multilist/async multilist/checkbox multilist/product multilist/radio multilist/transport picker popup range rating scroller scroller/base scroller/lazyimage scroller/refresh scroller/scroll scroller/sticky suggest suggest/base suggest/city_select_example suggest/use_with_popup swipemenu swipemenulist switch toast touchable'.split(' ');

async function __loadScript() {
    await loadScript(url + libJS);
}

async function loadAssetsByPage(page) {
    await loadCss(page);
    await loadScript(url + pageJS + page + '/index.js');
}

async function loadCss(page) {
    return new Promise((rs, rj) => {
        let head  = document.getElementsByTagName('head')[0];
        let link  = document.createElement('link');
        link.id   = cssIdPrefix + page;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = url + pageJS + page + '/index.css';
        link.media = 'all';
        let timer = setTimeout(() => rj(`load ${link.href} failed`), 3000);
        link.onload = () => {
            rs();
            clearTimeout(timer);
        };
        head.appendChild(link);
    });
}

describe('Test yo-demo', function() {
    // increase timeout
    this.timeout(200000);

    before(async() => {
        await beforeHook();
        let div = document.createElement('div');
        div.className = 'yo-root';
        div.id = 'content';
        document.body.appendChild(div);
        await __loadScript();
    });

    after(async() => {
        await afterHook();
    });

    beforeEach(async () => {
        window._babelPolyfill = false;
        await loadAssetsByPage(pages[CurrentIndex]);
    });

    afterEach(async () => {
        let node = g(cssIdPrefix + pages[CurrentIndex]);
        if (node && node.parentElement && CurrentIndex !== pages.length - 1) node.parentElement.removeChild(node);
        CurrentIndex++;
    });

    pages.forEach((page) => {
        it(`Test ${page}`, async () => {
            await browser.$pause(100);
            let scroller = document.querySelector('.yo-scroller');
            // only test scroller
            if (scroller) {
                let maxHeight = scroller.clientHeight;
                await browser.moveToObject(scroller, 0,  Math.ceil(maxHeight * 0.8))
                    .buttonDown()
                    .moveTo(null, 0, -Math.ceil(maxHeight * 0.2))
                    .moveTo(null, 0, -Math.ceil(maxHeight * 0.2))
                    .buttonUp()
                    .$apply();
                await browser.$pause(200);
            }
        });
    });
});
