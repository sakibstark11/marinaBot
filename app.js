/**
 * Module dependencies.
 */
var express = require('express'),
  Stopwatch = require("node-stopwatch").Stopwatch,
  routes = require('./routes'),
  sio = require('socket.io'),
  gpio = require('rpi-gpio'),
  wpi = require('wiring-pi'),
  crypto = require('crypto'),
  async = require('async'),
  Gpio = require('pigpio').Gpio,
  tank = {},
  pinVal = false,
  p7 = 7,
  p11 = 11,
  p13 = 13,
  p15 = 15,
  trig = 16,
  echo = 12,
  distance,
  app = module.exports = express.createServer(),
  time,
  time2,
  totaltime = 0,
  io = sio.listen(app);
// Configuration
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function () {
  app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.listen(3000);
//console.log('Listening %d in %s mode', app.address().port, app.settings.env);
tank.initPins = function () {
  async.parallel([
    gpio.setup(p7, gpio.DIR_OUT),
    gpio.setup(p11, gpio.DIR_OUT),
    gpio.setup(p13, gpio.DIR_OUT),
    gpio.setup(p15, gpio.DIR_OUT)
  ]);
};
tank.moveForward = function () {
  console.log("forward");
  async.parallel([
    gpio.write(p7, 0),
    gpio.write(p15, 0),
    gpio.write(p11, 1),
    gpio.write(p13, 1)
  ]);
};
function readInput(err) {
  if (err) throw err;
  gpio.read(echo, function(err, value) {
      if (err) throw err;
      console.log('The value is ' + value);
      pinVal = value;
  });
}
tank.getDistance = function () {
  var stop,start;
  gpio.setup(trig, gpio.DIR_OUT);
  gpio.setup(echo, gpio.DIR_IN);
  gpio.write(trig, 0);
  gpio.write(trig, 1);
  setTimeout(off, 10);
  var off = function () {
    gpio.write(trig, 0);
}
  while(pinVal == false){
    console.log("nosig");
    start = Date.now();
    readInput();
  }
  while(pinVal == true){
    console.log("sig");
    stop = Date.now();
    readInput();
  }
  console.log(stop-start);;
};

tank.goup = function () {
  console.log("up");
  async.parallel(
    [
      gpio.write(p7, 0),
      gpio.write(p11, 0),
      gpio.write(p13, 1),
      gpio.write(p15, 1)
    ]);
};
tank.godown = function () {
  console.log("down");
  async.parallel(
    [
      gpio.write(p13, 0),
      gpio.write(p15, 0),
      gpio.write(p7, 1),
      gpio.write(p11, 1)
    ]);
};
tank.moveBackward = function () {
  console.log("reverse");
  async.parallel(
    [
      gpio.write(p11, 0),
      gpio.write(p13, 0),
      gpio.write(p15, 1),
      gpio.write(p7, 1)
    ]);
};
tank.turnRight = function () {
  console.log("right");
  async.parallel([
    gpio.write(p7, 1),
    gpio.write(p13, 1),
    gpio.write(p11, 0),
    gpio.write(p15, 1)
  ]);
};
tank.turnLeft = function () {
  console.log("left");
  async.parallel([
    gpio.write(p7, 1),
    gpio.write(p13, 0),
    gpio.write(p11, 1),
    gpio.write(p15, 1)
  ]);
};
tank.stopAllMotors = function () {
  console.log("stop");
  async.parallel([
    gpio.write(p11, 1),
    gpio.write(p13, 1),
    gpio.write(p15, 1),
    gpio.write(p7, 1)
  ]);
};
io.sockets.on('connection', function (socket) {
  totaltime = 0;
  socket.on("disconnect", function () {
    console.log("Connection lost");

    // tank.goup();
    // setTimeout(tank.stopAllMotors, totaltime);
    // console.log("done");

  });
  socket.on('keydown', function (dir) {
    switch (dir) {
      case 'up':
        tank.moveForward();
        tank.getDistance();
        break;
      case 'down':
        tank.moveBackward();
        break;
      case 'left':
        tank.turnLeft();
        break;
      case 'right':
        tank.turnRight();
        break;
      case 'goup':
        time = new Date().getTime();
        tank.goup();
        break;
      case 'godown':
        time = new Date().getTime();
        tank.godown();
        break;
    }
  });
  socket.on('keyup', function (dir) {
    switch (dir) {
      case 'goup':
        time2 = Date.now();
        var diff = time2 - time;
        console.log("diff " + diff);
        totaltime -= diff;
        console.log("total " + totaltime);
        tank.stopAllMotors();
        break;
      case 'godown':
        time2 = Date.now();
        var diff = time2 - time;
        console.log("diff " + diff);
        totaltime += diff;
        console.log("total " + totaltime);
        tank.stopAllMotors();
        break;
      default:
        tank.stopAllMotors();
    }
  });
});
tank.initPins();