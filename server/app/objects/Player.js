module.exports = _.defineObject('Player', function () {
    let me = this;

    me.body = _.createBody(me);
});