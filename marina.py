import RPi.GPIO as gpio
import time
import Tkinter as tk
import sys

def distance():
    gpio.cleanup()
    echo = 12
    trig = 16
    gpio.setmode(gpio.BOARD)
    gpio.setup(trig,gpio.OUT)
    gpio.setup(echo,gpio.IN)
    gpio.output(trig,0)
    gpio.output(trig,1)
    time.sleep(0.00001)
    gpio.output(trig,0)
    while gpio.input(echo) == 0:
        pass
    start = time.time() 
    while gpio.input(echo) == 1:
        pass   
    stop = time.time()
    distance = (stop-start) * 17000
    gpio.cleanup()
    return distance
def init():
    gpio.cleanup()
    gpio.setmode(gpio.BOARD)
    gpio.setup(7,gpio.OUT)
    gpio.setup(11,gpio.OUT)
    gpio.setup(13,gpio.OUT)
    gpio.setup(15,gpio.OUT)
def right(tf):
    print("right")
    gpio.output(7,gpio.HIGH)
    gpio.output(13,gpio.LOW)
    gpio.output(11,gpio.HIGH)
    gpio.output(15,gpio.HIGH)
    time.sleep(tf)
    gpio.cleanup()
def left(tf):
    print("left")
    gpio.output(7,gpio.HIGH)
    gpio.output(13,gpio.HIGH)
    gpio.output(11,gpio.LOW)
    gpio.output(15,gpio.HIGH)
    time.sleep(tf)
    gpio.cleanup()
def forward(tf):
    print("forward")	
    gpio.output (7,gpio.LOW)
    gpio.output(15,gpio.LOW)
    gpio.output(11,gpio.HIGH)
    gpio.output(13,gpio.HIGH)
    time.sleep(tf)
    gpio.cleanup()
def reverse(tf):
    print("reverse")
    gpio.output(11,gpio.LOW)
    gpio.output(13,gpio.LOW)
    gpio.output(7,gpio.HIGH)
    gpio.output(15,gpio.HIGH)
    time.sleep(tf)
    gpio.cleanup()
def up(tf):
    print("up")
    gpio.output(7,gpio.LOW)
    gpio.output(11,gpio.LOW)
    gpio.output(13,gpio.HIGH)
    gpio.output(15,gpio.HIGH)
    time.sleep(tf)
    gpio.cleanup()
def down(tf):
    print ("down")
    gpio.output(13,gpio.LOW)
    gpio.output(15,gpio.LOW)
    gpio.output(7,gpio.HIGH)
    gpio.output(11,gpio.HIGH)
    time.sleep(tf)
    gpio.cleanup()
print("result ")    
print(distance()) 
#def key(event):
 #   init()
  #  print ("key: ", event.char)
   # key = event.char
    #tf = 0.20
 #   if key.lower() == 'w':
  #      forward(tf)
  #  elif key.lower() == 's':
      #  reverse(tf)
  #  elif key.lower() == 'a':
     #   left(tf)
  #  elif key.lower() == 'd':
    #    right(tf)
  #  elif key.lower() == 'q':
   #     up(tf)
  #  elif key.lower() == 'e':
     #   down(tf) 
    #else:
        #pass

#command = tk.Tk()
#command.bind ('<KeyPress>', key)
#command.mainloop()











