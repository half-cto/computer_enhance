import fs from 'fs';

// lookup table for registers
// access pattern regTable[registerBits][W]
// register bits - 0b000 ... 0b111
// W - 0, 1 
const regTable = [
	["AL", "AX"],
	["CL", "CX"],
	["DL", "DX"],
	["BL", "BX"],
	["AH", "SP"],
	["CH", "BP"],
	["DH", "SI"],
	["BH", "DI"]
];

const path = './data/listing_0037_single_register_mov';
const pathMany = './data/listing_0038_many_register_mov';

fs.readFile(pathMany, (_err, data) => {
	for (let i = 0; i < data.length; i += 2) {
		decode8086([data[i], data[i + 1]]);
	}
});

function decode8086(data) {
	const movInstr = 0b100010;
	if (!(data[0] >>> 2) === movInstr) {
		console.error("This is not a 'MOV' instruction!!!");
		return
	}

	const D = (data[0] & 0b10) >>> 1;		// D - direction of opereationg
	const W = data[0] & 0b1;			// W - length of data byte / word 
	const REG = (data[1] & 0b111000) >>> 3;		// REG - register value
	const RM = data[1] & 0b111			// RM - register / memory value;

	const [source, dest] = D ? [REG, RM] : [RM, REG];

	console.log(("MOV " + regTable[dest][W] + ", " + regTable[source][W]).toLowerCase());
}

