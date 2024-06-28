import fs from 'fs';

// lookup table for registers
// access pattern regTable[registerBits][W]
// register bits - 0b000 ... 0b111
// W - 0, 1 
const regTable = [
	["al", "ax"],
	["cl", "cx"],
	["dl", "dx"],
	["bl", "bx"],
	["ah", "sp"],
	["ch", "bp"],
	["dh", "si"],
	["bh", "di"]
]
// lookup table for effective address calculation
// access pattern effectiveAddrRegTable[R/M]
const effectiveAddrRegTable = [
	"bx + si",
	"bx + di",
	"bp + si",
	"bp + di",
	"si",
	"di",
	"bp",
	"bx"
]

const dispTable = [null, 1, 2];

const opCodes = {
	0b100010: "regMemMov",
	0b1011: "immediateToReg"
}

// Byte length of operation based on MOD field (table 4-10 R/M Field Encoding) - exception for MOD b000 R/M 0b110
const modOpLength = [2, 3, 4, 2];

const path = './data/listing_0039_more_movs';

fs.readFile(path, (_err, data) => {
	if (_err) {
		console.log(_err);
		return;
	}

	for (let i = 0; i < data.length;) {
		if ((data[i] >>> 2) === 0b100010) {
			const MOD = data[i + 1] >>> 6;
			const RM = data[i + 1] & 0b111;
			// if R/M == 0b110 && MOD == 0b00 exception from effectiveAddrRegTable
			if (RM + MOD === 6) {
				console.log('-- OP Length : 4 --- Exception!!!');
				i += 4;
			} else if (MOD === 0b11) {
				decodeRegOp(data.slice(i, i + 2));
				i += modOpLength[MOD];
			} else {
				decodeRegMemOp(MOD, data.slice(i, i + modOpLength[MOD]));
				i += modOpLength[MOD];
			}
		} else if ((data[i] >>> 4) === 0b1011) {
			const W = (data[i] & 0b1000) >>> 3;
			const opLength = W ? 3 : 2;
			decodeImmediateToReg(W, data.slice(i, i + opLength));
			i += opLength;
		}
	}
});

function decodeImmediateToReg(W, opBytes) {
	const REG = opBytes[0] & 0b111;
	const data = W ? (opBytes[2] << 8) | opBytes[1] : opBytes[1];

	const convertedNum = binaryToSignedInt(data);
	// to log out data in same form as input - in next line replace convertedNum to data
	// currently converting to signed integer to match text in .asm file
	console.log(`mov ${regTable[REG][W]}, ${convertedNum}`)
}

// TODO
// ! refactor with this info --- >> (0b10101111 ^ 0b11111111).toString(2).padStart(8, '0')
function binaryToSignedInt(number) {
	let numStr = number.toString(2);
	const padAmmount = numStr.length > 8 ? 16 : 8;
	numStr = numStr.padStart(padAmmount, '0');
	// if most significant byte is 1, parse negative
	const mask = padAmmount === 8 ? 0b11111111 : 0b1111111111111111
	if (numStr[0] === '1') {
		return (((((~number) >>> 0) + 1) & mask) * -1);
	} else {
		return number;
	}
}

function decodeRegMemOp(MOD, opBytes) {
	const [D, W, REG, RM] = getOpParams(opBytes);
	const decodedRM = `[${effectiveAddrRegTable[RM]}${getDispValue(MOD, opBytes)}]`;
	const decodedREG = regTable[REG][W];

	const result = D ? [decodedREG, decodedRM] : [decodedRM, decodedREG];
	console.log(`mov ${result[0]}, ${result[1]}`);
}

function decodeRegOp(opBytes) {
	const [D, W, REG, RM] = getOpParams(opBytes);
	const [source, dest] = D ? [RM, REG] : [REG, RM];
	console.log(`mov ${regTable[dest][W]}, ${regTable[source][W]}`);
}

function getDispValue(MOD, opBytes) {
	if (!MOD) {
		return '';
	} else if (MOD === 0b01) {
		return opBytes[2] ? ` + ${opBytes[2].toString()}` : '';
	} else {
		return ` + ${((opBytes[3] << 8) | opBytes[2]).toString()}`;
	}
}

function getOpParams(opBytes) {
	const D = (opBytes[0] & 0b10) >>> 1;			// D - direction of opereation
	const W = opBytes[0] & 0b1;				// W - length of data byte / word 
	const REG = (opBytes[1] & 0b111000) >>> 3;		// REG - register value
	const RM = opBytes[1] & 0b111				// RM - register / memory value;
	return [D, W, REG, RM];
}
