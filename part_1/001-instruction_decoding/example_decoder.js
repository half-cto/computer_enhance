const mask = 0b1111;
const bitSize = 4;
const getValue = (data, index) => {
	index *= bitSize;
	const res = ((mask << index) & data) >>> index;
	console.log(res.toString(2));
	return res;
}
const setValue = (data, index, value) => {
	index *= bitSize;
	const res = (data & ~(mask << index)) | ((value & mask) << index)
	console.log(res.toString(2));
	return res;
}


let int1 = 0;

console.log("--- int1 : ", int1.toString(2));
int1 = setValue(int1, 3, 4);
console.log("--- int1 : ", int1.toString(2));
getValue(int1, 2);
console.log("--- int1 : ", int1.toString(2));
