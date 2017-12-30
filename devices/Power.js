class Power {

	constructor(DeviceControler, id, shiftId, state) {
		this.DeviceControler = DeviceControler
		this.inputId = id
		this.shiftId= shiftId
		this.state = state
	}

	setState(state) {
		this.state = state
		let ON = (this.state.Active)? 1:0
		this.DeviceControler.shiftOne(this.shiftId, ON)
	}

	setActive(active) {
		this.DeviceControler.setDeviceActive(this.inputId, active)
	}

	getStatus() {
		return this.DeviceControler.getDeviceStatus(this.inputId)
	}
}

module.exports = Power