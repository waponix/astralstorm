module.exports = function () {
    //draw game UI's for the player
    //write the game elapsed time
    let pos = {x: 0, y: 0};
    pos.x = Viewport.width * 0.5;
    pos.y = 0;
    drawSprite('ui_timebar', pos.x, pos.y, null, true, this.sid);
    let gameTime = new Date(World.elapsed);
    pos.y = 15;
    gameTime = ('0' + gameTime.getMinutes()).substr(-2) + ':' + ('0' + gameTime.getSeconds()).substr(-2);
    drawText(gameTime, pos.x, pos.y, {
        align: 'center',
        size: '10px',
        color: '#FFFFFF',
        alpha: 1
    }, true, this.sid);

    //draw the health bar
    let barColor = ['#00FF00', '#BBFF00', '#FFAA00', '#FF2200'];
    let stat = barColor[0];
    if (this.health <= 35) {
        stat = barColor[3];
    } else if (this.health <= 50) {
        stat = barColor[2];
    } else if (this.health <=75) {
        stat = barColor[1];
    }
    drawSprite('ui_healthbar', 5, 5, {
        vars: {
            hp: this.health,
            stat: stat
        }
    }, true, this.sid);
    drawText(this.username.substr(0,10), 80, 30, {
        size: '10px',
        color: '#FFFFFF',
        align: 'center',
        font: 'Segoe UI Light'
    }, true, this.sid);

    //draw username on top of player
    drawText(this.username.substr(0,10), this.x + 10, this.y - (this.body.radius + 20), {
        size: '12px',
        font: 'Segoe UI Light',
        align: 'center'
    }, false, null, this.sid);
    drawSprite('ui_mini_healthbar', this.x, this.y - (this.body.radius + 5), {
        vars: {
            hp: this.health,
            stat: stat
        }
    }, false, null, this.sid);

    //mouse cursor;
    this.curRot += 2;
    drawSprite('ui_cursor', Viewport.mouseX, Viewport.mouseY, {
        vars: {color: '#00FFFF'},
        angle: this.curRot
    }, true, this.sid);

    runScript('miniMap', this);
};