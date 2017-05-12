# Qreact

## Description

Alternative to React, same api and behavior, eg: lifecycle, vnodes data structure, smaller size.

    minified: 60KB 
    gzipped : 20KB 

## Usage

### Install

```
    npm install qreact
```

### UMD
    
#### 1, copy umd version of Qreact

```
    cp node_modules/qreact/dist/qreact.[min.]js yourPRDDir
    // also version for react native web which includes PanResponder
    cp node_modules/qreact/dist/qreact-react-web.[min.]js yourPRDDir
```

#### 2, modify pack config, eg: webpack

Any libs of `[react,react-dom]/lib/xx` being used, if these is a `qreact/lib/xx` version, or `qreact.xxx`, should add to alias or externals.

##### available lib mount on qreact 

```jsx
    qreact.EventConstants      = react-dom/lib/EventConstants;
    qreact.SyntheticEvent      = react-dom/lib/SyntheticEvent;
    qreact.EventPluginRegistry = react-dom/lib/EventPluginRegistry;
    qreact.PooledClass         = react/lib/PooledClass;
    qreact.reactProdInvariant  = [react/react-dom]/lib/prodInvariant;
    qreact.SyntheticUIEvent    = react-dom/lib/SyntheticUIEvent;
    qreact.EventPropagators    = react-dom/lib/EventPropagators;
    qreact.accumulate          = react-dom/lib/accumulate;
    qreact.EventPluginUtils    = react-dom/lib/EventPluginUtils;
    qreact.EventPluginHub      = react-dom/lib/EventPluginHub;
    qreact.EventEmitter        = react-dom/lib/ReactBrowserEventEmitter;
```

##### webpack.config.js

```jsx
    exports.config = {
        ...
        externals: {
            'react': 'qreact',
            'react-dom': 'qreact',
            'react-dom/lib/EventConstants': 'qreact.EventConstants',
            'react-dom/lib/TouchHistoryMath': 'qreact.TouchHistoryMath',
            'react-dom/lib/EventPluginRegistry': 'qreact.EventPluginRegistry',
            'react-dom/lib/EventPluginUtils': 'qreact.EventPluginUtils',
            'react-dom/lib/ResponderEventPlugin': 'qreact.ResponderEventPlugin',
            'react-dom/lib/ResponderTouchHistoryStore': 'qreact.ResponderTouchHistoryStore',
            'react-dom/lib/CSSPropertyOperations': 'qreact.CSSPropertyOperations',
            'react-dom/lib/ReactBrowserEventEmitter': 'qreact.EventEmitter',
            'react/lib/onlyChild': 'qreact.Children.only',
            'react/lib/PooledClass': 'qreact.PooledClass',
            ...
        },
        resolve: {
            alias: {
                ...
            }
        }
    }
```

#### 3, include by script tag

```html
    <script type="text/javascript" src="yourPRDDir/qreact[-react-web].[min.]js"></script>
    <script type="text/javascript">
        xxxx
    </script>
```

### COMMONJS

#### modify pack config, eg: webpack

Any libs of `[react,react-dom]/lib/xx` being used, if these is a `qreact/lib/xx` version, should add to alias.

```jsx
    exports.config = {
        ...
        resolve: {
            alias: {
                'react$': 'qreact',
                'react-dom$': 'qreact',
                'react-dom/lib/EventConstants': 'qreact/lib/EventConstants',
                'react-dom/lib/SyntheticEvent': 'qreact/lib/SyntheticEvent',
                'react-dom/lib/EventPluginRegistry': 'qreact/lib/EventPluginRegistry',
                'react-dom/lib/SyntheticUIEvent': 'qreact/lib/SyntheticUIEvent',
                'react-dom/lib/EventPropagators': 'qreact/lib/EventPropagators',
                'react-dom/lib/accumulate': 'qreact/lib/accumulate',
                'react-dom/lib/EventPluginUtils': 'qreact/lib/EventPluginUtils',
                'react-dom/lib/EventPluginHub': 'qreact/lib/EventPluginHub',
                'react-dom/lib/ReactBrowserEventEmitter': 'qreact/lib/ReactBrowserEventEmitter',
                ...
            }
        }
    }
```

### Using Devtools

here is UMD `node_modules/qreact/dist/devtools.js`, copy or pack it.

```html
    <script src="${path}/devtools.js"></script>  
```

## Thanks To

Qreact bases on [developit preact@7.1.0](https://github.com/developit/preact/tree/7.1.0/), [developit preact-compat@3.14.1](https://github.com/developit/preact-compat/tree/3.14.1) and [Facebook React@v15.3.1](https://github.com/facebook/react/tree/v15.3.1).

The core parts, include virtual dom and mechanism of diff base on Preact. We modify the data structure of vnodes and diff algorithm refer to React to bring better diffing and narrow gap with original React.

The event system of Orignal React is used to replace Preact event binder, also PanResponder is included to support React Native Web.


## License

MIT
