class LedCW {

	constructor(DeviceControler, id, pwm, pin1, pin2, pin3) {
		this.DeviceControler = DeviceControler
		this.inputId = id
		this.pwm = pwm
		this.pin1 = pin1
		this.pin2 = pin2
		this.pin3 = pin3
		this.DeviceControler.initDevice(this.inputId, this.pwm, this.pin1, this.pin2, this.pin3)
	}

	setState(state) {
		console.log("seting State")
		this.state = state
		if (this.state.rgb) {
			const C =   parseInt(this.state.rgb.substr(1, 2), 16)
			const W =   parseInt(this.state.rgb.substr(3, 2), 16)

			const time = (this.state.time > 1500)? this.state.time : 500 
			this.DeviceControler.setLightsState(this.inputId, C, W, 0, time)	
		}
	}

	setActive(active) {
		this.DeviceControler.setDeviceActive(this.inputId, active)
	}

	getStatus() {
		return this.DeviceControler.getDeviceStatus(this.inputId)
	}


}

module.exports = LedCW