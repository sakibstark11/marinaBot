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
  Gpio = require('pigpio').Gpio,
  tank = {},
  pinVal = false,
  connection,
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
  gpio.reset();
  gpio.setup(p7, gpio.DIR_OUT);
  gpio.setup(p11, gpio.DIR_OUT);
  gpio.setup(p13, gpio.DIR_OUT);
  gpio.setup(p15, gpio.DIR_OUT);
};
tank.moveForward = function () {
  console.log("FORWARD");
  gpio.write(p7, 0);
  gpio.write(p15, 0);
  gpio.write(p11, 1);
  gpio.write(p13, 1);
};
function getDistance() {
  var MICROSECDONDS_PER_CM = 1e6 / 34321;
  var trigger = new Gpio(23, { mode: Gpio.OUTPUT });
  var echo = new Gpio(18, { mode: Gpio.INPUT, alert: true });
  trigger.digitalWrite(0); // Make sure trigger is low
  var startTick;
  var prox;
  trigger.trigger(10, 1);
  return new Promise((resolve, reject) => {
    echo.on('alert', (level, tick) => {
      if (level == 1) {
        startTick = tick;
      } else {
        var endTick = tick;
        var diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
        prox = diff / 2 / MICROSECDONDS_PER_CM;
        distance = prox;
        resolve(prox)
      }
    });
  });
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
var autonomy = function () {
  while (!connection) {
    var curDis;
    getDistance().then(result => {
      curDis = result;
      console.log("current ", curDis);
      if (curDis < 15) {
        tank.moveBackward();  
      }
      setTimeout(tank.stopAllMotors, 1000);
    });
  }
}
var selfRescue = function () {
  if (totaltime > 0) {
    tank.goUp();
    setTimeout(tank.stopAllMotors, totaltime);
    console.log("done");
    totaltime = 0;
  }
  else {
    console.log("did not move on z axis");
  }
}
tank.goDown = function () {
  console.log("Down");
  gpio.write(p7, 0);
  gpio.write(p11, 0);
  gpio.write(p13, 1);
  gpio.write(p15, 1);
};
tank.goUp = function () {
  console.log("UP");
  gpio.write(p7, 1);
  gpio.write(p11, 1);
  gpio.write(p13, 0);
  gpio.write(p15, 0);
};
tank.moveBackward = function () {
  console.log("REVERSE");
  gpio.write(p11, 0);
  gpio.write(p13, 0);
  gpio.write(p15, 1);
  gpio.write(p7, 1);
};
tank.turnRight = function () {
  console.log("RIGHT");
  gpio.write(p7, 1);
  gpio.write(p11, 0);
  gpio.write(p13, 1);
  gpio.write(p15, 1);
};
tank.turnLeft = function () {
  console.log("LEFT");
  gpio.write(p7, 1);
  gpio.write(p11, 1);
  gpio.write(p13, 0);
  gpio.write(p15, 1);
};
tank.stopAllMotors = function () {
  console.log("Stop");
  gpio.write(p11, 1);
  gpio.write(p13, 1);
  gpio.write(p15, 1);
  gpio.write(p7, 1);
  getDistance().then(result => {
    console.log("distance: ", result);
  });
};
io.sockets.on('connection', function (socket) {
  console.log("user connected");
  connection = true;
  totaltime = 0;
  socket.on('disconnect', function () {
    console.log("Connection lost");
    connection = false;
    autonomy();
    //selfRescue();
  });
  socket.on('keydown', function (dir) {
    switch (dir) {
      case 'up':
        tank.moveForward();
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
        time = Date.now();
        tank.goUp();
        break;
      case 'godown':
        time = Date.now();
        tank.goDown();
        break;
    }
  });
  socket.on('keyup', function (dir) {
    switch (dir) {
      case 'goup':
        time2 = Date.now();
        var diff = time2 - time;
        totaltime -= diff;
        console.log("total " + totaltime);
        tank.stopAllMotors();
        break;
      case 'godown':
        time2 = Date.now();
        var diff = time2 - time;
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