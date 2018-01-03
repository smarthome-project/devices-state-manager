class DeviceControler {

	constructor(PythonShell, SerialPort, socket, fork, shiftregister_state = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] ){
		this.PythonShell 		 = PythonShell
		this.SerialPort  		 = SerialPort
		this.socket 			 = socket
		this.shiftregister_state = shiftregister_state
		this.ready               = false
		this.runing              = false
		this.commands            = []
	}

	setPort(port) {
		this.port = port
		this.socket.emit("getDevices")
	}

	setReady(ready) {
		this.ready = ready
	}

	procesJob() {
		console.log("procesJob", this.ready)
		if (this.ready && !this.runing) {
			this.runing = true
			let job = this.commands[0]
			this.commands.shift()
			console.log("take next job ", job)
			console.log("take job ", job)
			if (job) {
				this.ready = false
				console.log("procesing job: ", job)
				this.port.write(	job,  () => {
					this.port.drain( () => {
						console.log("drain")
						this.runing = false
					})
				})
			} else {
				this.runing = false
			}
		}
	}

	deinitArduino (callback) {
		this.port.close(() => {
			callback(true)
		})
	}

	initDevice(id, pwm, pin1, pin2, pin3) {
		console.log("init device " + id)
		//to do do some checks
		let PWM = (pwm)? 'true':'false'
		let data = 'in(' + id + ',' + PWM + ',' + pin1 + ',' + pin2 + ',' + pin3+ ');'
		console.log("init Device data: ", data)
		this.commands.push(data)
	}

	setLightsState(id, R, G, B, time) {
		console.log("lights")
		let data = 'lt(' + id + ',' + R + ':' + G + ':' + B + ',' + time + ');'
		console.log(data)
		
		this.commands.push(data)
	}

	setDeviceActive(id, enable) {

		let data = 'e(' + id + ',' + enable + ');'

		this.commands.push(data)
	}

	getDeviceStatus (id) {
		let data = 'sd(' + id + ');'
		this.commands.push(data)
	}

	shiftOne(id, enable) {
		console.log("shiftOne")
		let state = (enable)?"1":"0"
		let data = `so(${id},${state})`
		this.commands.push(data)
	}

	shiftInit(state) {
		console.log("shift init")
		let data = `ir(${state})`
		this.commands.push(data)
	}

	setSecure(enable) {
		let val = (enable == "true" || enable == 1)? "true":"false"
		let data = `sec(${val});`
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