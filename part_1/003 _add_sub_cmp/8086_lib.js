/**
* Retrun instruction params
* @param {number[]} opBytes first two bytes of instruction 
* @returns {{ D, W, REG, RM }} Returns instrucion params { D, W, REG, RM }
*/
export function getOpParams(opBytes) {
	const D = (opBytes[0] & 0b10) >>> 1;			// D - direction of opereation
	const W = opBytes[0] & 0b1;				// W - length of data byte / word 
	const REG = (opBytes[1] & 0b111000) >>> 3;		// REG - register value
	const RM = opBytes[1] & 0b111;				// RM - register / memory value;
	const MOD = opBytes[1] >>> 6;				// MOD 
	return { D, W, REG, RM, MOD };
}

export const opTable = {
	0b000: "add",
	0b101: "sub",
	0b111: "cmp"
}

export const modOpLengthTable = [2, 3, 4, 2];
