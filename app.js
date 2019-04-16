/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    sio = require('socket.io'),
    gpio = require('rpi-gpio'),
    crypto = require('crypto'),
    async = require('async'),
    tank = {},
    p7  = 7,
    p11   = 11,
    p13 = 13,
    p15  = 15,
    app = module.exports = express.createServer(),
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
  async.parallel([
    gpio.write(p7,0),
    gpio.write(p11, 0),
    gpio.write(p13,1),
    gpio.write(p15,1)
  ]);
};
tank.godown = function(){
  async.parallel([
    gpio.write(p13,0),
    gpio.write(p15,0),
    gpio.write(p7,1),
    gpio.write(p11,1)
  ]);
};

tank.moveBackward = function(){
  async.parallel([
    gpio.write(p11,0),
    gpio.write(p13,0),
    gpio.write(p15,1),
    gpio.write(p7,1)
  ]);
};

tank.turnRight = function(){
  gpio.write(p7,1);
  gpio.write(p13,1);
  gpio.write(p11,0);
  gpio.write(p15,1);
};

tank.turnLeft = function(){
  gpio.write(p7,1);
  gpio.write(p13,0);
  gpio.write(p11,1);
  gpio.write(p15,1);
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
  
  socket.on('keydown', function(dir) {
    switch(dir){
     case 'up':
        console.log("forward");
        tank.moveForward();
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
        console.log("right")
        break;
      case 'goup':
        tank.goup();
        console.log("up")
        break;
      case 'godown':
        tank.godown();
        console.log("down")
        break;              
    }
  });

  socket.on('keyup', function(dir){
    tank.stopAllMotors();
  });

});
io.socket.on('disconnect', function(){
  console.log("connection lost");
  });
tank.initPins();
