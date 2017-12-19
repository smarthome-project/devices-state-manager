const express 	   = require('express')
const bodyParser   = require('body-parser')
const _ 		   = require('lodash')
const PythonShell  = require('python-shell')
const SerialPort   = require("serialport")

const { fork } = require('child_process');

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

deviceControler = new DeviceControler(PythonShell, SerialPort, io, fork)
initArduino(deviceControler)

io.on('connect', function (socket) {
	console.log('Connected!')

	io.on("allDevicesData", devices => {
		for (var inputId in devices) {
			createDevice(inputId, devices[inputId])
			console.log("creatingDevices")
		}
	})

	io.on("changeState", ({id, state, time = null}) => {
		if(time)
			state.time = time
		if(DevicesMap[id])
			DevicesMap[id].setState(state)
	})

	io.on("removeDevice", (id) => {
		if(DevicesMap[id]) {
			DevicesMap[id].setActive(false)
			delete DevicesMap[id]
		}
	})

	io.on("initDevice", (device) => {
		createDevice(device.pin_settings_id, device)
	})

	io.on("getDeviceStatus", (id) => {
		if(DevicesMap[id])
			DevicesMap[id].getStatus()
	})

})

function createDevice(inputId, device) {
	switch(device.type) {
		case "POWER":
			DevicesMap[inputId] = new Power(deviceControler, inputId, device.shift_id, device.state)
	    	break
	    case "LEDRGB":
	        DevicesMap[inputId] = new LedRGB(deviceControler, inputId, device.pwm, device.pin1, device.pin2, device.pin3)
	        break
	}
}

process.on('SIGINT', () => {
	deviceControler.deinitArduino((res) => {
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
	//setInterval(function(){deviceControler.procesJob()},1000)
})



function initArduino (controler) {
	let port
	SerialPort.list( (err, ports) => {
		if(!err) {
			ports.forEach((device) => {
				if(device.manufacturer && device.manufacturer.toLowerCase().indexOf("arduino") !== -1) {
					console.log("arduino FOUND!")
					const Readline = SerialPort.parsers.Readline

					port = new SerialPort(device.comName, { autoOpen: false })

					port.open(function (err) {
						if (err) 
							return console.log('Error opening port: ', err.message)
					})

					port.on('error', function(err) {
						console.log('SerialPort Error: ', err.message)
					})
					
					parser = port.pipe(new Readline())
					parser.on('data', (data) => {
						if (data.indexOf("READY") !== -1) {
							console.log("setting true")
							controler.setReady(true)
							controler.procesJob()
						}
						console.log(data)
					})

					controler.setPort(port)
					console.log("set PORT")
				}
			})
		} else {
			console.log("Cannot load SerialPort.")
		}
	})
}