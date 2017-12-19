class LedRGB {

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

		this.state = state

		const R =   parseInt(this.state.rgb.substr(1, 2), 16)
		const G =   parseInt(this.state.rgb.substr(3, 2), 16)
		const B =   parseInt(this.state.rgb.substr(5, 2), 16)

		const time = (this.state.time > 1500)? this.state.time : 1500 
		this.DeviceControler.setLightsState(this.inputId, R, G, B, time)

	}

	setActive(active) {
		this.DeviceControler.setDeviceActive(this.inputId, active)
	}

	getStatus() {
		return this.DeviceControler.getDeviceStatus(this.inputId)
	}

}

module.exports = LedRGB