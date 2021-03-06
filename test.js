var Gpio = require('pigpio').Gpio;

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius


var watchHCSR04 = function () {
    var MICROSECDONDS_PER_CM = 1e6 / 34321;
    var trigger = new Gpio(23, { mode: Gpio.OUTPUT });
    var echo = new Gpio(18, { mode: Gpio.INPUT, alert: true });
    trigger.digitalWrite(0); // Make sure trigger is low
    var startTick;
    trigger.trigger(10, 1);
    echo.on('alert', (level, tick) => {
        if (level == 1) {
            startTick = tick;
        } else {
            var endTick = tick;
            var diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
            console.log(diff / 2 / MICROSECDONDS_PER_CM);
        }
    });
    trigger.digitalWrite(0);
    echo.digitalWrite(0);
};

watchHCSR04();

// Trigger a distance measurement once per second
// setInterval(() => {
//   trigger.trigger(10, 1); // Set trigger high for 10 microseconds
// }, 1000);