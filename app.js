const express 	   = require('express')
const bodyParser   = require('body-parser')
const _ 		   = require('lodash')
const PythonShell  = require('python-shell')
const SerialPort   = require("serialport")

const config = require('./config')

var app = express() 

app.get('*', function(req, res){
	res.send('server')
})

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

