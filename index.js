var express = require('express');
var app = express();

app.use(express.static('public'));

var http = require('http').Server(app);
var io = require('socket.io')(http);

var game = {};
game.width = 10000;
game.height = 10000;

var players = {};
var ranking = [];
var blocks = {};
var pointers = {};
var effects = {
      index: 0,
      hit: {}
    };
var speed = 3.5;

var bSpeed = 25;
var bulletDelay = 11.5;
var reloadDelay = 45;
var bulletLoad = 300;

var rSpeed = 10;
var rLoad = 0;

var allBullets = {};

var timeStart = new Date();
var elapsedTime = '';


app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){

  socket.on('disconnect', function(){

    var keys = Object.keys(players);

    for(var i = 0; i < keys.length; i++){
      var key = keys[i];
      var player = players[key];

      if(player.socket == socket.id){
        delete players[key];
      }
    }

  });
  
  socket.on('addPlayer', function(data){

    players[data.key] = {
      socket: socket.id,
      health: 100,
      destroyed: false,
      target:null,
      rank: 0,
      explotion: {
        x: 0,
        y: 0,
        radius: 17.5,
        color: '',
        border: 20,
        opacity: 1,
        hidden: true
      },
      viewPort: {
        width: 0,
        height: 0,
        top: 0,
        left: 0
      },
      respawn: false,
      timer: 0,
      countdown: 5,
      score: 0,
      group: 'undefined',
      color: 'rgb('+Random(100, 255)+', '+Random(100, 255)+', '+Random(100, 255)+')',
      x: Random(70, game.width - 70),
      y: Random(70, game.height - 70),
      w: 20,
      h: 10,
      mouseX: 0,
      mouseY: 0,
      direction: 0,
      speed: 0,
      rotation: 0,
      rotX: 0,
      rotY: 0,
      bIndex: 0,
      rIndex: 0,
      rTrigger: true,
      bDelay: bulletDelay,
      bLoad: bulletLoad,
      rDelay: reloadDelay,
      rLoad: 0,
      bColor: '#00ffff',
      bRGBA: 'rgba(0, 255, 255, 0.5)',
      collide: {
        radius: 20,
        x: 0,
        y: 0
      },
      bullet: {},
      rocket: {}
    };
  
  });

  socket.on('input', function(data){

    players[data.key][data.appendKey] = data.value;

  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setInterval(function(){
    var timeNow = new Date();
    elapsedTime = parseInt(timeNow - timeStart);
  
    var keys = Object.keys(players);
    var fxKeys = Object.keys(effects.hit);

    for(var i = 0; i < fxKeys.length; i++){
      var key = fxKeys[i];
      var fx = effects.hit[key];

      var explotion = fx;
          effects.hit[key].opacity -= 0.02;
          effects.hit[key].border -= 1.5;
          effects.hit[key].radius += 0.9;
          effects.hit[key].color = 'rgba(0,255,246,'+explotion.opacity+')';

          if(effects.hit[key].opacity < 0){
            delete effects.hit[key];
          }
    }

    pointers = {};
    
    for(var i = 0; i < keys.length; i++){
      var key = keys[i];
      var player = players[key];

      players[key].rotX = players[key].mouseX - players[key].x;
      players[key].rotY = players[key].mouseY - players[key].y;

      players[key].rotation = Math.atan2(players[key].rotY, players[key].rotX) / Math.PI * 180;

      distance = (Math.sqrt( (players[key].rotX * players[key].rotX) + (players[key].rotY * players[key].rotY) ) / 80 < 8 ) ? Math.sqrt( (players[key].rotX * players[key].rotX) + (players[key].rotY * players[key].rotY) ) / 80 : 8;
      players[key].speed = distance;

      players[key].direction = players[key].rotation;
      players[key].x = players[key].x + players[key].speed * Math.cos(players[key].direction * Math.PI / 180);
      players[key].y = players[key].y + players[key].speed * Math.sin(players[key].direction * Math.PI / 180);
    
      players[key].x = (players[key].x <= 70) ? 70 : players[key].x;
      players[key].y = (players[key].y <= 70) ? 70 : players[key].y;
      players[key].x = (players[key].x >= game.width - 70) ? game.width - 70 : players[key].x;
      players[key].y = (players[key].y >= game.height - 70) ? game.height - 70 : players[key].y;

      players[key].collide.x = players[key].x;
      players[key].collide.y = players[key].y;

      players[key].explotion.x = players[key].x;
      players[key].explotion.y = players[key].y;

      var tx = players[key].x;
      var ty = players[key].y;

      if(players[key].destroyed){

        players[key].timer = (players[key].timer <= 110) ? players[key].timer + 1: 0;
        if(players[key].timer === 110){
          
          players[key].countdown -= 1;
          
          if(players[key].countdown <= 0){

            players[key].countdown = 5;
            players[key].timer = 0;
            players[key].x = Random(70, game.width - 70);
            players[key].y = Random(70, game.height - 70);
            players[key].bLoad = bulletLoad;
            players[key].rDelay = reloadDelay;
            players[key].health = 100;
            players[key].fire = false;
            players[key].bColor = '#00ffff';
            players[key].bRGBA = 'rgba(0, 255, 255, 0.5)';
            players[key].rLoad = 5;
            players[key].destroyed = false;
          
          }
        }

      }

        /*FIRE BULLETS*/
        if(player.fire && !player.destroyed){
          if(player.bDelay === bulletDelay && players[key].bLoad){
            players[key].bLoad = (players[key].bLoad > 0 ) ? players[key].bLoad - 10 : 0;
            players[key].bullet[players[key].bIndex] = {
              damage: 10,
              color: "#55ffff",
              x: tx, 
              y: ty, 
              w: 5, 
              h: 5,
              direction: players[key].rotation,
              radius: bSpeed,
              origin: key,
              originGroup: 'undefined',
              collide: {
                radius: 2.5,
                origin: key,
                x: 0,
                y: 0
              }
            };

            allBullets[players[key].bIndex] = players[key].bullet[players[key].bIndex];
            
            players[key].bIndex += 1;
          }
          if(players[key].bLoad == 0){
            players[key].bColor = '#ff1e00';
            players[key].bRGBA = 'rgba(0,255,246,0.5)';
          }
          players[key].bDelay = (players[key].bDelay <= 0) ? bulletDelay : players[key].bDelay - 1;
        }else{
          player.bDelay = bulletDelay;          
        }

        


        /*FIRE ROCKETS*/
        if(player.fireRocket && players[key].rTrigger && !player.destroyed && player.rLoad > 0 && player.target != null){
          
          console.log(player.target);
          players[key].rocket[players[key].rIndex] = {

            color: '#a800ff',
            follow: true,
            damage: 15,
            accelerate: 0,
            target: players[key].target,
            x: tx,
            y: ty,
            dx: players[key].mouseX,
            dy: players[key].mouseY,
            direction: players[key].rotation,
            radius: 1.5,
            origin: key,
            originGroup: 'undefined',
            collide: {
              radius: 2.5,
              origin: key,
              x: 0,
              y: 0
            }

          }

          /*players[key].rLoad -= 1;*/

          players[key].rocket[players[key].rIndex].dInitial = Random(players[key].rocket[players[key].rIndex].direction -+ 35, players[key].rocket[players[key].rIndex].direction -+ 35);

          players[key].rIndex+=1;

          players[key].rTrigger = false;
        }
        


        if(player.reload && !player.fire){
          players[key].bColor = '#00ffff';
          players[key].bRGBA = 'rgba(0,255,255,0.5)';
          if(player.rDelay === 0){
            players[key].bLoad = (players[key].bLoad < bulletLoad ) ? players[key].bLoad + 10 : bulletLoad;
          }
          players[key].rDelay = (players[key].rDelay <= 0) ? reloadDelay : players[key].rDelay - 1;
        }else{
          player.rDelay = reloadDelay;
        }

        if(!player.explotion.hidden){
          var explotion = player.explotion;
          players[key].explotion.opacity -= 0.02;
          players[key].explotion.border -= 1.5;
          players[key].explotion.radius += 1.5;
          players[key].explotion.color = 'rgba(0,255,246,'+explotion.opacity+')';
        
          if(players[key].explotion.opacity <=0 ){
            players[key].explotion = {
                                        x: 0,
                                        y: 0,
                                        radius: 17.5,
                                        color: '',
                                        border: 20,
                                        opacity: 1,
                                        hidden: true
                                      };
          }
        }


        /*BULLET DYNAMICS*/
        var bKeys = Object.keys(player.bullet);
        for(var b = 0; b < bKeys.length; b++){
          var bKey = bKeys[b];
          var blts = player.bullet[bKey];

          players[key].bullet[bKey].x = player.bullet[bKey].x + blts.radius * Math.cos(blts.direction * Math.PI / 180);
          players[key].bullet[bKey].y = player.bullet[bKey].y + blts.radius * Math.sin(blts.direction * Math.PI / 180);

          players[key].bullet[bKey].collide.x = players[key].bullet[bKey].x;
          players[key].bullet[bKey].collide.y = players[key].bullet[bKey].y;

          allBullets.x = players[key].bullet[bKey].x;
          allBullets.y = players[key].bullet[bKey].y;

          var collide = Collide(players[key].bullet[bKey], players, key);
          
          if(collide.result && !players[collide.key].destroyed){
            
            players[collide.key].health -= players[key].bullet[bKey].damage;

            effects.hit[effects.index] = {
              x: collide.x,
              y: collide.y,
              opacity: 1,
              border: 15,
              color: 'rgba(0,255,246,1)',
              radius: 3
            };

            effects.index += 1;

            if(players[collide.key].health <= 0){
              players[key].score += 1;
              players[collide.key].health = 100;
              players[collide.key].destroyed = true;
              players[collide.key].explotion.hidden = false;
            }

            delete players[key].bullet[bKey]; 
          
          }else if(players[key].bullet[bKey].x <= 0 || players[key].bullet[bKey].y <= 0 || players[key].bullet[bKey].x >= game.width || players[key].bullet[bKey].y >= game.height){ 
           
            delete players[key].bullet[bKey]; 
          
          }
        }


        



        /*ROCKET DYNAMICS*/
        var rKeys = Object.keys(player.rocket);
        for(var r = 0; r < rKeys.length; r++){
          

          var rKey = rKeys[r];
          var rckt = player.rocket[rKey];


          /*var rx = (rckt.target != null && typeof players[rckt.target] != 'undefined') ? (players[rckt.target].x - rckt.x) : 0;
          var ry = (rckt.target != null && typeof players[rckt.target] != 'undefined') ? (players[rckt.target].y - rckt.y) : 0;
          var distance = Math.sqrt(rx * rx + ry * ry);
          var rDirection = Math.atan2(ry, rx) / Math.PI * 180;

          var target = (rckt.target != null && typeof players[rckt.target] != 'undefined') ? Math.atan2(players[rckt.target].x, players[rckt.target].y): 0;
          var difference = (rckt.target != null && typeof players[rckt.target] != 'undefined') ? target - rckt.direction: 0;

          if(difference > Math.PI){
            difference = ((2 * Math.PI) - difference);
          }
          if(difference < -Math.PI){
            difference = ((2 * Math.PI) + difference);
          }

          var delta = (difference < 0) ? -(rckt.direction/60): (rckt.direction/60);


          players[key].rocket[rKey].radius = (players[key].rocket[rKey].radius <= rSpeed) ? players[key].rocket[rKey].radius + 0.25 : rSpeed;

          if(rckt.follow){
            if(rckt.target != null){
              
              players[key].rocket[rKey].direction += (delta * (elapsedTime / 1000));

            } 
            
          }

          players[key].rocket[rKey].x = player.rocket[rKey].x + rckt.radius * Math.cos(players[key].rocket[rKey].direction * Math.PI / 180);
          players[key].rocket[rKey].y = player.rocket[rKey].y + rckt.radius * Math.sin(players[key].rocket[rKey].direction * Math.PI / 180);*/


          var targetX = players[rckt.target].x - players[key].rocket[rKey].x;
          var targetY = players[rckt.target].y - players[key].rocket[rKey].y;
          var rotation = Math.atan2(targetY, targetX) * 180 / Math.PI;

          if (Math.abs(rotation - players[key].rocket[rKey].direction) > 180){
              
              if (rotation > 0 && players[key].rocket[rKey].direction < 0){

                players[key].rocket[rKey].direction -= (360 - rotation + players[key].rocket[rKey].direction) / 10;
              
              }else if (players[key].rocket[rKey].direction > 0 && rotation < 0){
              
                players[key].rocket[rKey].direction += (360 - rotation + players[key].rocket[rKey].direction) / 10;
              
              }
              
          }else if (rotation < players[key].rocket[rKey].direction){
              
              players[key].rocket[rKey].direction -= Math.abs(players[key].rocket[rKey].direction - rotation) / 10;
          
          }else{
          
              players[key].rocket[rKey].direction += Math.abs(rotation - players[key].rocket[rKey].direction) / 10;
          
          }  

          players[key].rocket[rKey].x = players[key].rocket[rKey].x + rSpeed * Math.cos(rckt.direction * Math.PI / 180);
          players[key].rocket[rKey].y = players[key].rocket[rKey].y + rSpeed * Math.sin(rckt.direction * Math.PI / 180);

          players[key].rocket[rKey].collide.x = players[key].rocket[rKey].x;
          players[key].rocket[rKey].collide.y = players[key].rocket[rKey].y;

          var collide = Collide(players[key].rocket[rKey], players, key);

          if(collide.result && !players[collide.key].destroyed){

            players[collide.key].health -= players[key].rocket[rKey].damage;

            effects.hit[effects.index] = {
              x: collide.x,
              y: collide.y,
              opacity: 1,
              border: 15,
              color: 'rgba(0,255,246,1)',
              radius: 3
            };

            effects.index += 1;

            if(players[collide.key].health <= 0){
              players[key].score += 1;
              players[collide.key].health = 100;
              players[collide.key].destroyed = true;
              players[collide.key].explotion.hidden = false;
            }

            delete players[key].rocket[rKey];

          }else if(rckt.target != null && players[rckt.target].destroyed){

            effects.hit[effects.index] = {
              x: rckt.x,
              y: rckt.y,
              opacity: 1,
              border: 15,
              color: 'rgba(0,255,246,1)',
              radius: 3
            };

            effects.index += 1;

            delete players[key].rocket[rKey];

          }else if(rckt.target == null && players[key].rocket[rKey].x <= 0 || players[key].rocket[rKey].y <= 0 || players[key].rocket[rKey].x >= game.width || players[key].rocket[rKey].y >= game.height){ 
           
            delete players[key].rocket[rKey]; 
          
          }
        }






        for(var i2 = 0; i2 < keys.length; i2++){
          var key2 = keys[i2];

          if(key != key2){

            var player2 = players[key2];
            pointers[key+key2] = {};

            pointers[key+key2].origin = key;
            pointers[key+key2].socket = player2.socket;
            pointers[key+key2].opacity = 1;
            pointers[key+key2].show = true;
            pointers[key+key2].x = 50;
            pointers[key+key2].y = 50;

            pointers[key+key2].x = (player2.x > player.viewPort.left && player2.x > player.viewPort.left + player.viewPort.width) ? player.viewPort.width - 50: (player2.x < player.viewPort.left && player2.x < player.viewPort.left + player.viewPort.width) ? 50: player2.x - player.viewPort.left;
            pointers[key+key2].y = (player2.y > player.viewPort.top && player2.y > player.viewPort.top + player.viewPort.height) ? player.viewPort.height - 50: pointers[key+key2].y = (player2.y < player.viewPort.top && player2.y < player.viewPort.top + player.viewPort.height) ? 50: player2.y - player.viewPort.top;;

            if(player2.x > player.viewPort.left && player2.x < player.viewPort.left + player.viewPort.width && player2.y > player.viewPort.top && player2.y < player.viewPort.top + player.viewPort.height){
              pointers[key+key2].show = false;
            }

            var px = player2.x - player.x;
            var py = player2.y - player.y;
            pointers[key+key2].opacity = 1 - (Math.sqrt(px * px + py * py) / 9500);
            pointers[key+key2].direction = Math.atan2(py, px) / Math.PI * 180;
          }

        }
    }

    ranking = [];
    for(var i = 0; i < keys.length; i++){
      var key = keys[i];
      var player = players[key];

      ranking.push({key: key, name: player.name, score: player.score});
      ranking = ranking.sort(srt(null,'score'));

      var rks = Object.keys(ranking);
      for(var r = 0; r < rks.length; r++){
        var rk = rks[r];
        var rank = ranking[rk];

        players[rank.key].rank = eval(rk + '+ 1');
      }
    }

    io.emit('updateTime', elapsedTime);
    io.emit('updatePointers', pointers);
    io.emit('updateRanking', ranking);
    io.emit('update', players);
    io.emit('updateFX', effects);
    

}, 10);

/*FUNCTIONS*/
function Random(min, max){
  return Math.floor((Math.random() * max) + min);
}

function Collide(obj1, obj2, filter){

  var result = {};
  result.result = false;
  var keys = Object.keys(obj2);

  for(var i = 0; i < keys.length; i++){
    var key = keys[i];
    var col1 = obj1.collide;
    var col2 = obj2[key].collide;

    var dx = col1.x - col2.x;
    var dy = col1.y - col2.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (key != filter && distance < col1.radius + col2.radius) {
        result.key = key;
        result.x = col1.x;
        result.y = col2.y;
        result.result = true;
    }
  }

  return result;

}

function Group(array){

  var group = {};

  for(var i = 0; i < array.length; i++){

    var getEach = array[i];
    var keys = Object.keys(getEach);

    for(var a = 0; a < keys.length; a++){
      var key = keys[a];
      var obj = getEach[key];

      group[key] = obj;
    }

  }

  return group;

}

function srt(desc,key) {
 return function(a,b){
   return desc ? ~~(key ? a[key] > b[key] : a > b) 
               : ~~(key ? a[key] < b[key] : a < b);
  };
}