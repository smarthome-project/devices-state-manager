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
		if (this.ready) {
			this.runing = true
			let job = this.commands.pop()
			console.log("take next job ", job)
			if (job) {
				console.log("procesing job: ", job)
				this.port.write(	job,  () => {
					this.port.drain( () => {
						console.log("drain")
						this.runing = false
						this.procesJob()
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
		//to do do some checks
		let data = 'deviceInit(' + id + ',' + pwm + ',' + pin1 + ',' + pin2 + ',' + pin3+ ');'
		console.log("init Device data: ", data)
/*		this.port.write(data, () => {
			this.port.drain(() => {

			})
		})*/
		this.commands.push(data)
		this.procesJob()
	}

	setLightsState(id, R, G, B, time) {
		let data = 'ledTime(' + id + ',' + R + ':' + G + ':' + B + ',' + time + ');'
		console.log(data)
		
		this.commands.push(data)
		this.procesJob()
	}

	setDeviceActive(id, enable) {

		let data = 'enable(' + id + ',' + enable + ');'

		this.commands.push(data)
		this.procesJob()
	}

	getDeviceStatus (id) {
		let data = 'showDevice(' + id + ');'
		this.commands.push(data)
		this.procesJob()
	}

	shiftOne(id, enable) {
		let state = (enable)?"1":"0"
		let data = `shiftOne(${id},${state});`
		this.commands.push(data)
		this.procesJob()
	}

	shiftInit(state) {
		console.log(state)
		let data = `initRegister(${state});`
		console.log(data)
		this.commands.push(data)
		this.procesJob()
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