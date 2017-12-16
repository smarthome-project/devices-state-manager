class DeviceControler {

	constructor(PythonShell, SerialPort, socket, shiftregister_state = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ){
		this.PythonShell 		 = PythonShell
		this.SerialPort  		 = SerialPort
		this.socket 			 = socket
		this.shiftregister_state = shiftregister_state
		this.initArduino()
	}

	initArduino () {
		this.SerialPort.list( (err, ports) => {
			let port = undefined
			if(!err) {
				ports.forEach((device) => {
					if(device.manufacturer && device.manufacturer.toLowerCase().indexOf("arduino") !== -1) {
						console.log("arduino FOUND!")
						this.port = new this.SerialPort(device.comName, {
							parser: this.SerialPort.parsers.readline('\n')
						})
						this.port.on('data', function (data) {
							console.log('Data: ' + data)
						})
					}
				})
				if (port) 
					return port
				else {
					console.log("no port")
					this.socket.emit("noPort","can't find arduino")
				}

			} else {
				console.log("Cannot load SerialPort.")
			}
		})
	}

	deinitArduino (callback) {
		this.port.close(() => {
			callback(true)
		})
	}

	initDevice(id, pwm, pin1, pin2, pin3) {
		//to do do some checks
		let data = 'deviceInit(' + id + ',' + pwm + ',' + pin1 + ',' + pin2 + ',' + pin3+ ');'
		this.port.write(data, () => {
			this.port.drain(() => {

			})
		})
	}

	setLightsState(id, R, G, B, time) {
		let data = 'ledTime(' + id + ',' + R + ':' + G + ':' + B + ',' + time + ');'

		this.port.write(	data, function () {
			this.port.drain( function() {
				res.json(data).status(200).end()
			})
		})
	}

	setDeviceActive(id, enable) {

		let data = 'enable(' + id + ',' + enable + ');'

		this.port.write(	data, function () {
			this.port.drain( function() {

			})
		})
	}

	getDeviceStatus (id) {
		let data = 'showDevice(' + id + ');'

		this.port.write(	data, function () {
			this.port.drain( function() {
				console.log(data)
			})
		})
	}

	shiftregister(id, enable) {
		if(id < 0 || id > 15) {
			//bad id 
		} else {
			this.shiftregister_state[id] = (enable == 'true') ? 1 : 0

			//get those pins from constructor

			let data, clock, latch
			data = 12
			clock = 16
			latch = 18

			let states = this.shiftregister_state.slice()
			let args = [data, clock, latch].concat(states.reverse())

			let options = {
				scriptPath: 'scripts',
				args: args
			}

			this.PythonShell.run('shiftregister.py', options, (err, results) => {
				if (err) {
					throw err
				}
			})
		}	
	}

	spin(id, direction) {

		if(direction != 'l' && direction != 'r') {
			//res.status(404).end()
		} else {
			let motor_l, motor_r
			motor_l = 23
			motor_r = 24

			let options = {
				scriptPath: 'scripts',
				args: [motor_l, motor_r, direction]
			}

			PythonShell.run('motors.py', options, (err, results) => {
				if (err) {
					//res.status(404).end()
					throw err
				}
				res.json(results)
			})
		}	
	}

	testPython(req, res, next) {

		let options = {
			scriptPath: '../scripts',
			args: ['value1', 'value2', 'value3']
		}

		PythonShell.run('my_script.py', options, (err, results) => {
			if (err) throw err
			console.log('results: %j', results)

		})
	}
}
//END OF CLASS

module.exports = DeviceControler