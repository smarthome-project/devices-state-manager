class DeviceControler {

	constructor(PythonShell, SerialPort, socket, shiftregister_state = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ){
		this.PythonShell 		 = PythonShell
		this.SerialPort  		 = SerialPort
		this.socket 			 = socket
		this.shiftregister_state = shiftregister_state
		this.port 				 =  initArduino()
	}

	initArduino () {
		SerialPort.list(function (err, ports) {
			if(!err) {
				ports.forEach((device) => {
					if(device.manufacturer && device.manufacturer.toLowerCase().indexOf("arduino") !== -1) {
						port = new SerialPort(device.comName, {
							parser: SerialPort.parsers.readline('\n')
						})
						port.on('data', function (data) {
							console.log('Data: ' + data)
						})
						return port
					}
				})
			} else {
				console.log("Cannot load SerialPort.")
			}
		})
	}

	deinitArduino (callback) {
		port.close(() => {
			callback(true)
		})
	}

	initDevice(id, pwm, pin1, pin2, pin3) {
		//to do do some checks
		let data = 'deviceInit(' + id + ',' + pwm + ',' + pin1 + ',' + pin2 + ',' + pin3+ ');'
		port.write(data, () => {
			port.drain(() => {
				//TO DO CHANGE STATE EMIT 
				////res.status(201).end()
			})
		})
	}

	setLightsState(id, R, G, B, time) {
		let data = 'ledTime(' + id + ',' + R + ':' + G + ':' + B + ',' + time + ');'

		port.write(	data, function () {
			port.drain( function() {
				res.json(data).status(200).end()
			})
		})
	}

	setDeviceActive(id, enable) {

		let data = 'enable(' + id + ',' + enable + ');'

		port.write(	data, function () {
			port.drain( function() {
				//res.json(data).status(200).end()
			})
		})
	}

	getDeviceStatus (id) {
		let data = 'showDevice(' + id + ');'

		port.write(	data, function () {
			port.drain( function() {
				//res.json(data).status(200).end()
			})
		})
	}

	shiftregister(id, enable) {
		if(id < 0 || id > 15) {
			//bad id 
		} else {
			shiftregister_state[id] = (enable == 'true') ? 1 : 0

			//get those pins from constructor

			let data, clock, latch
			data = 12
			clock = 16
			latch = 18

			let states = shiftregister_state.slice()
			let args = [data, clock, latch].concat(states.reverse())

			let options = {
				scriptPath: 'scripts',
				args: args
			}

			PythonShell.run('shiftregister.py', options, (err, results) => {
				if (err) {
					//res.status(404).end()
					throw err
				}
				res.json(results)
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
			//res.json(results)
		})
	}
}
//END OF CLASS

