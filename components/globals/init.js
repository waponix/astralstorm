module.exports = () => {
    global._assets = {
        audios: {},
        sprites: {}
    };
    require('./functions')();
    require('./world')();
    require('./viewport')();
    require('./object')();
    require('./body')();
    require('./sprite')();
    require('./text')();
    require('./audio')();
};