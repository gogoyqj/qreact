#!bin/bash

echo 'start build'
kernal=$(uname -s)
alias ised="sed -i \"\""
if [ $kernal = "Linux" ];
then
    alias ised="sed -i\"\""
fi

specialParts="react-web mini";

# build qreact-react-web.js
echo 'build umd'
configs="_rollup.config.js _react-web.config.js _mini.config.js"

for config in $configs;do
    cp -f rollup.config.js $config;
done

for part in $specialParts;do
    cp -f src/preact-compat.js src/preact-compat-${part}.js
    ised "s/\/\/ comment-start/\/\* comment-start/g" src/preact-compat-${part}.js
    ised "s/\/\/ comment-end/comment-end *\//g" src/preact-compat-${part}.js
done

ised "s/\/\/ comment-start/\/\* comment-start/g" src/preact-compat.js
ised "s/\/\/ comment-end/comment-end *\//g" src/preact-compat.js

# special replace for react native web & mini
for part in $specialParts;do
    ised "s/dist\/qreact\.js/dist\/qreact-${part}.js/g" _${part}.config.js
    ised "s/src\/preact-compat\.js/src\/preact-compat-${part}.js/g" _${part}.config.js
    if [ $part == 'react-web' ];then
        ised "s/\/\/ import '.\/event\/injectResponderEventPlugin'/import '.\/event\/injectResponderEventPlugin'/" src/preact-compat-${part}.js
    else
        ised "s/\/\/ rm-for-mini-start/\/*/" src/preact-compat-${part}.js
        ised "s/\/\/ rm-for-mini-end/*\//" src/preact-compat-${part}.js
    fi
    rollup -c _${part}.config.js
    ./node_modules/.bin/uglifyjs dist/qreact-${part}.js -o dist/qreact-${part}.min.js -p relative -m --source-map dist/qreact-${part}.min.map
done
# build qreact.js with rollup
rollup -c rollup.config.js
# minify qreact.min.js -m, --mangle names/pass mangler true
./node_modules/.bin/uglifyjs dist/qreact.js -o dist/qreact.min.js -p relative -m --source-map dist/qreact.min.map

ised "s/\/\* comment-start/\/\/ comment-start/g" src/preact-compat.js
ised "s/comment-end \*\//\/\/ comment-end/g" src/preact-compat.js

for part in $specialParts;do
    ised "s/\/\* comment-start/\/\/ comment-start/g" src/preact-compat-${part}.js
    ised "s/comment-end \*\//\/\/ comment-end/g" src/preact-compat-${part}.js
done

echo 'build es'
for config in $configs;do
    ised "s/dist\//es\//g" $config
    ised "s/'default'/'named'/g" $config
    ised "s/\'umd\'/\'es\'/g" $config
    rollup -c $config
done


ised "s/\/\/ comment-start/\/\* comment-start/g" src/preact-compat.js
ised "s/\/\/ comment-end/comment-end *\//g" src/preact-compat.js
for part in $specialParts;do
    ised "s/\/\/ comment-start/\/\* comment-start/g" src/preact-compat-${part}.js
    ised "s/\/\/ comment-end/comment-end *\//g" src/preact-compat-${part}.js
done

echo 'build cjs'
for config in $configs;do
    ised "s/es\//cjs\//g" $config
    ised "s/\'es\'/\'cjs\'/g" $config
    ised "s/'named'/'default'/g" $config
    rollup -c $config
    rm -f $config
done
# rm -f src/preact-compat-react-web.js
ised "s/\/\* comment-start/\/\/ comment-start/g" src/preact-compat.js
ised "s/comment-end \*\//\/\/ comment-end/g" src/preact-compat.js

# since rollup didn't remove comments, remove "[//|/*|*] @provides" with sed
ised "s/@provides//g" dist/qreact.js
for part in $specialParts;do
    ised "s/@provides//g" dist/qreact-${part}.js
done

# try to get gzipped size
checkgzip=$(which gzip)
if [ -x $checkgzip ];then
    gzip -fk dist/qreact.min.js
    if [ $? -ne 0 ];then
        echo 'gzip faild'
        exit 250
    fi
    echo "gziped size $(ls -lh dist/qreact.min.js.gz | awk '{print $5}')"
    rm dist/qreact.min.js.gz
fi


echo 'start copy lib'

if [ ! -d lib ];then
    mkdir lib
else
    rm -rf lib/*
fi

# react event libs
# exclude: onlyChild findNodeHandle CSSPropertyOperations TouchHistoryMath
libsToExports="EventConstants EventPluginRegistry PooledClass reactProdInvariant EventPluginUtils SyntheticUIEvent EventPropagators accumulate EventPluginHub SyntheticEvent ViewportMetrics ReactBrowserEventEmitter"
for lib in $libsToExports;do
    cp -rf src/lib/${lib}.js lib/
done

# ResponderEventPlugin dependences, TapEventPlugin
libsToExports="injectResponderEventPlugin normalizeNativeEvent ResponderTouchHistoryStore ResponderEventPlugin TapEventPlugin ResponderSyntheticEvent findNodeHandle CSSPropertyOperations TouchHistoryMath"
for lib in $libsToExports;do
    #babel src/event/${lib}.js --out-file lib/${lib}.js
    #echo "stupid transform: "src/event/${lib}.js" you'd better check"
    filename=src/event/${lib}.js
    if [ ! -f $filename ];then
        filename=src/lib/${lib}.js
    fi
    node scripts/es6-2-es5.js $filename > lib/${lib}.js
done

# preact-compat libs
compatLibs=$(find src/compat-lib -name "*.js")
for lib in $compatLibs;do
    filename=`basename $lib`
    sed "s/preact-compat/qreact/g" $lib > lib/${filename}
done

echo 'build devtools'
rollup -c ./rollup.devtools.config.js

echo 'done'

webdriverioPath=`find node_modules -name webdriverio -type d`
cp -rf wdo-touch.js ${webdriverioPath}/build/lib/commands/touch.js
cp -rf wdo-getLocation.js ${webdriverioPath}/build/lib/commands/getLocation.js