const assert = require('node:assert/strict');
const {calculate} = require('../calculator.js');
assert.deepEqual(calculate('tri','closed',100),{x:100,panels:[98,100,100],openWidth:298});
assert.deepEqual(calculate('tri','open',298),{x:100,panels:[98,100,100],openWidth:298});
assert.deepEqual(calculate('quad','closed',135),{x:135,panels:[135,135,133,131],openWidth:534});
assert.deepEqual(calculate('quad','open',534),{x:135,panels:[135,135,133,131],openWidth:534});
for(const kind of ['tri','quad'])for(const x of [50,75,100,100.5,135,190]) {
  const result=calculate(kind,'closed',x);
  assert.ok(Math.abs(result.panels.reduce((a,b)=>a+b,0)-result.openWidth)<1e-9);
  assert.ok(Math.abs(calculate(kind,'open',result.openWidth).x-x)<1e-9);
}
for(const value of [0,-1,NaN,Infinity,'100',undefined])assert.throws(()=>calculate('tri','closed',value));
assert.throws(()=>calculate('tri','closed',2));
assert.throws(()=>calculate('tri','open',4));
assert.throws(()=>calculate('quad','closed',4));
assert.throws(()=>calculate('quad','open',10));
console.log('Tríptico, cuadríptico, cálculo inverso, decimales y valores inválidos: OK');
