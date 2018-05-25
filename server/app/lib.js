module.exports = ($s) => {
    lib.call($s);
};

function lib() {
    this.lib = {
        express: require('express'),
        sio: require('socket.io'),
        http: require('http'),
        path: require('path'),
        fs: require('file-system'),
        hash: require('shorthash'),
        uuid: require('uuid/v4'),
        matter: require('matter-js/build/matter.js')
    };
};