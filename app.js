/**
 * Module dependencies.
 */

var express = require('express'),
    Stopwatch = require("node-stopwatch").Stopwatch,
    routes = require('./routes'),
    sio = require('socket.io'),
    gpio = require('rpi-gpio'),
    crypto = require('crypto'),
    async = require('async'),
    stopwatch = Stopwatch.create(),
    tank = {},
    p7  = 7,
    p11   = 11,
    p13 = 13,
    p15  = 15,
    app = module.exports = express.createServer(),

    time,
    time2,
    totaltime = 0,
    io = sio.listen(app);

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);

app.listen(3000);
//console.log('Listening %d in %s mode', app.address().port, app.settings.env);
tank.initPins = function(){
  async.parallel([
    gpio.setup(p7,gpio.DIR_OUT),
    gpio.setup(p11,gpio.DIR_OUT),
    gpio.setup(p13,gpio.DIR_OUT),
    gpio.setup(p15,gpio.DIR_OUT)
  ]);
};

tank.moveForward = function(){
  async.parallel([
    gpio.write(p7,0),
    gpio.write(p15,0),
    gpio.write(p11,1),
    gpio.write(p13,1)

  ]);
};

tank.goup = function(){
  async.parallel(
    [
    gpio.write(p7,0),
    gpio.write(p11, 0),
    gpio.write(p13,1),
    gpio.write(p15,1)
  ]);
};
tank.godown = function(){ 
  async.parallel(
    [
    gpio.write(p13,0),
    gpio.write(p15,0),
    gpio.write(p7,1),
    gpio.write(p11,1)
  ]);
};

tank.moveBackward = function(){
  async.parallel(
    [
    gpio.write(p11,0),
    gpio.write(p13,0),
    gpio.write(p15,1),
    gpio.write(p7,1)
  ]);
};

tank.turnRight = function(){
  async.parallel([  
  gpio.write(p7,1),
  gpio.write(p13,1),
  gpio.write(p11,0),
  gpio.write(p15,1)
]);
};

tank.turnLeft = function(){
  async.parallel([ 
  gpio.write(p7,1),
  gpio.write(p13,0),
  gpio.write(p11,1),
  gpio.write(p15,1)
]);
};

tank.stopAllMotors = function(){
  async.parallel([
    gpio.write(p11, 1),
    gpio.write(p13, 1),
    gpio.write(p15, 1),
    gpio.write(p7, 1)
  ]);
};
io.sockets.on('connection', function(socket) {
  socket.on("disconnect", function(){
    console.log("Connection lost");
    var counttime = new Date().getTime();
    while(new Date().getTime()-counttime < totaltime)
    {
      tank.goup();
      console.log("loop");
    }


});
  socket.on('keydown', function(dir) {
    switch(dir){
     case 'up':
        tank.moveForward();
        console.log("forward");
        break;
      case 'down':
        tank.moveBackward();
        console.log("reverse");
        break;
      case 'left':
        tank.turnLeft();
        console.log("left");
        break;
      case 'right':
        tank.turnRight();
        console.log("right");
        break;
      case 'goup':
        time = new Date().getTime();
        console.log(time);
        tank.goup();
        // stopwatch.start();
        console.log("up");
        break;
      case 'godown':
        time = new Date().getTime();
        console.log(time);
        tank.godown();
        // stopwatch.start();
        console.log("down");
        break;              
    }
  });

  socket.on('keyup', function(dir){
    switch(dir){
      case 'goup':
      time2 = new Date().getTime();
      var diff = time2 - time;
      console.log("diff "+ diff);
      totaltime -= diff;
      console.log("total " +totaltime);
      // totaltime -= stopwatch.elapsed.seconds;
      // stopwatch.stop();
      console.log("total " +totaltime);
      tank.stopAllMotors();
      break;
      case 'godown':
      time2 = new Date().getTime();
      var diff = time2 - time;
      console.log("diff "+ diff);
      totaltime += diff;
      console.log("total " +totaltime);
      
      // totaltime += stopwatch.elapsed.seconds;
      // stopwatch.stop();
      console.log("total " +totaltime);
      tank.stopAllMotors();
      break;
      default:
      tank.stopAllMotors();
    }
  });

});
tank.initPins();
