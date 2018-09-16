module.exports = () => {
    global._Text = function () {
        this._id = null;
        this.x = 0;
        this.y = 0;
        this.color = '#FFFFFF';
        this.alpha = 1;
        this.angle = 0;
        this.text = '';
        this.align = 'left';
        this.style = {
            size: '14px',
            font: 'Orbitron'
        };
        this.depth = 0;
        this._type = 'text';
        this.sid = null;
        this.onViewport = false;

        this._destroy = () => {
            delete World._objects.Draw[this._id];
        };
    };
};