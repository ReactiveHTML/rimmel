export const Classes = new Proxy({}, {
	memo: new Map(),
	scramble: stuff => stuff,
	get: function(target, prop, receiver) {
		const scrambled = this.scramble(prop)
		this.memo.set(prop, scrambled)
		return scrambled
	},
})
