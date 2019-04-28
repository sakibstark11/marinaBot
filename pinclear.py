import RPi.GPIO as gpio
gpio.setmode(gpio.BOARD)
gpio.setup(7,gpio.OUT)
gpio.setup(11,gpio.OUT)
gpio.setup(13,gpio.OUT)
gpio.setup(15,gpio.OUT)
gpio.output(7,1)
gpio.ouput(11,1)
gpio.output(13,1)
gpio.output(15,1)

