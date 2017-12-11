const express 	   = require('express')
const bodyParser   = require('body-parser')
const _ 		   = require('lodash')
const PythonShell  = require('python-shell')
const SerialPort   = require("serialport")

const config = require('./config')

var app = express() 

var socket = require('socket.io-client')('http://localhost:3300', {reconnect: true})

// Add a connect listener
socket.on('connect', function (socket) {
    console.log('Connected!');
});

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

