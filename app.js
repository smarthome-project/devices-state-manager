const express 	   = require('express')
const bodyParser   = require('body-parser')
const _ 		   = require('lodash')
const PythonShell  = require('python-shell')
const SerialPort   = require("serialport")

const DeviceControler = require('./libs/DeviceControl.js')
const Power           = require('./devices/Power.js')
const LedRGB           = require('./devices/LedRGB.js')
const LedWhite           = require('./devices/LedWhite.js')

const config = require('./config')

var app = express()


var DevicesMap = {} 
var deviceControler = undefined

var io = require('socket.io-client')('http://localhost:3300', {reconnect: true, query: "Type=controler"})
// Add a connect listener
io.on('connect', function (socket) {
	console.log('Connected!')
	deviceControler = new DeviceControler(PythonShell, SerialPort, io)
	io.emit("getDevices")
	io.on("allDevicesData", devices => {
		for (var inputId in devices) {
			createDevice(inputId, devices[inputId])
		}
	})


	io.on("changeState", ({id, state}) => {
		DevicesMap[id].setState(state)
	})

	io.on("removeDevice", (id) => {
		DevicesMap[id].setActive(false)
		delete DevicesMap[id]
	})

	io.on("initDevice", ({id, device}) => {
		createDevice(id, device)
	})
})


function createDevice(inputId, device) {
	switch(device.type) {
		case "power":
			DevicesMap[inputId] = new Power(deviceControler, inputId,device.shift_id, device.state)
	}
}

process.on('SIGINT', () => {
	devicesRouter.deinitArduino((res) => {
		if(res) {
			console.log("\nDeinicjalizacja zakończona powodzeniem.\n")
			process.exit()
		} else {
			console.log("\nDeinicjalizacja zakończona błędem.\n")
			process.exit()
		}
	})
})

app.listen(config.port, function(){
	console.log('Server started on ',config.port)
})

