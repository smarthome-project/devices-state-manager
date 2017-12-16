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
		this.DeviceControler.setLightsState(this.inputId, this.state.R, this.state.G, this.state.B, this.state.time)
		/*
			and emit this state ?
				this.state.time = 0
		*/
	}

	setActive(active) {
		this.DeviceControler.setDeviceActive(this.inputId, active)
	}


}