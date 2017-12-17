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

deviceControler = new DeviceControler(PythonShell, SerialPort, io)
initArduino(deviceControler)

io.on('connect', function (socket) {
	console.log('Connected!')
	
	io.emit("getDevices")
	io.on("allDevicesData", devices => {
		for (var inputId in devices) {
			createDevice(inputId, devices[inputId])
			console.log("creatingDevices")
		}
	})

	io.on("changeState", ({id, state}) => {
		DevicesMap[id].setState(state)
	})

	io.on("removeDevice", (id) => {
		DevicesMap[id].setActive(false)
		delete DevicesMap[id]
	})

	io.on("initDevice", (device) => {
		createDevice(device.pin_settings_id, device)
	})

	io.on("getDeviceStatus", (id) => {
		DevicesMap[id].getStatus()
	})

	io.on("testInit", () => {
		deviceControler.port.write("deviceInit(2,true,22,23,24);", () => {
			deviceControler.port.drain(() => {

			})
		})
	})
})


function createDevice(inputId, device) {
	switch(device.type) {
		case "power":
			DevicesMap[inputId] = new Power(deviceControler, inputId, device.shift_id, device.state)
			//console.log(DevicesMap[inputId].getStatus())
	    	break
	    case "ledrgb":
	    	console.log("TO DO INIT VALUES !!!")
	        DevicesMap[inputId] = new LedRGB(deviceControler, inputId, true, 22, 23, 24, 25)
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
})

function initArduino (controler) {
	let port
	SerialPort.list( (err, ports) => {
		if(!err) {
			ports.forEach((device) => {
				if(device.manufacturer && device.manufacturer.toLowerCase().indexOf("arduino") !== -1) {
					console.log("arduino FOUND!")
					const Readline = SerialPort.parsers.Readline

					port = new SerialPort(device.comName)
					parser = port.pipe(new Readline())
					parser.on('data', (data) => {
						console.log("data form arduino: ", data)
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