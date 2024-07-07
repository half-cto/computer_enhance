import fs from 'fs';
import { opTable, getOpParams, modOpLengthTable } from './8086_lib.js'
const path = './data/listing_0041_add_sub_cmp_jnz';

fs.readFile(path, (_err, data) => {
	if (_err) {
		console.log(_err);
		return;
	}

	for (let i = 0; i < data.length;) {
		const opType = getOpType(data[i], data[i + 1]);
		const opLength = getOpLenght(data[i], data[i + 1]);
		const instructionBytes = [];
		for (let j = i; j <= i + opLength; j++) {
			instructionBytes.push(byteToString(data[j]));
		}
		const instructionBytesString = instructionBytes.join(" ");
		console.log(`${opType} --- byte count ${opLength + 1} -- bytes : ${instructionBytesString}`);
		i += opLength;
	}
});

/**
* Takes first two bytes of instruction. Returns OP length.
* @param {Number} firstByte byte of instruction 
* @param {Number} secondByte byte of instruction 
* @returns {Number} Returns how many bytes are used by this instruction
*/
function getOpLenght(firstByte, secondByte) {
	const opParams = getOpParams([firstByte, secondByte]);
	// if bit[6] -> immediate to accumulator
	if ((firstByte >>> 2) & 1) {
		if (opParams.W) {
			return 3
		}
		return 2
	}
	// if reg/mem with register to either
	let opLen = 0;
	if (opParams.RM + opParams.MOD === 6) {
		opLen = 4;
	} else {
		opLen = modOpLengthTable[opParams.MOD];
	}
	// if immediate to register/memory
	if (firstByte >>> 7) {
		if (!opParams.D && opParams.W) {
			opLen += 2;
		} else {
			opLen += 1;
		}
	}
	return opLen
}

/**
* Takes first two bytes of instruction. Returns OP type.
* @param {Number} firstByte byte of instruction 
* @param {Number} secondByte byte of instruction 
* @returns {String}  type of operation
*/
function getOpType(firstByte, secondByte) {
	const firstBit = firstByte >>> 7;
	if (!firstBit) {
		const opBits = (firstByte >>> 3) & 0b111;
		return opTable[opBits];
	} else if (firstBit) {
		const opBits = (secondByte >>> 3) & 0b111;
		return opTable[opBits];
	} else {
		return "op not in table"
	}
}

/**
* Takes one byte and turns in to string  
* @param {Number} num 
* @returns {String} String representation of byte
*/
function byteToString(byte) {
	return byte.toString(2).padStart(8, '0');
}

