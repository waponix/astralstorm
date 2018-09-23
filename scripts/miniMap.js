let map = {
    width: 300,
    height: 300,
    viewport: {
        width: 300,
        height: 300,
        radius: 150,
        x: 0,
        y: 0
    },
    x: 0,
    y: 0,
    radius: 250,
};

function toMapX(x, base) {
    return base * (x / World.dimension.width);
}

function toMapY(y, base) {
    return base * (y / World.dimension.height);
}

module.exports = function () {
    let players = instancesPos('Player', this.sid);

    map.x = toMapX(this.x, map.width);
    map.y = toMapY(this.y, map.height);

    //the map base
    this.radarRot -= 0.5;
    drawSprite('minimap_base', Viewport.width - (map.viewport.width * 0.5), (map.viewport.height * 0.5), {
        vars: {
            radius: map.viewport.radius,
        },
        alpha: 0.5,
        angle: this.radarRot
    }, true, this.sid);

    //draw enemy pins
    for (let i in players) {
        let x = toMapX(players[i].x, map.width);
        let y = toMapY(players[i].y, map.height);
        let dir = pointDirection(x, y, map.x, map.y);
        let dis = pointDistance(x, y, map.x, map.y);
        x = (Viewport.width - (map.viewport.width * 0.5)) - lengthDirX(dis, dir);
        y = (map.viewport.height * 0.5) - lengthDirY(dis, dir);
        if (dis <= map.viewport.radius) drawSprite('minimap_enemy_pin', x, y, null, true, this.sid);
    }

    //draw main player pin on map
    drawSprite('minimap_main_pin', Viewport.width - (map.viewport.width * 0.5), (map.viewport.height * 0.5), {
        angle: this.sprite.angle,
        depth: 200
    }, true, this.sid);
};