function print(n) {
  if (typeof n === 'string' || typeof n === 'number' || typeof n === 'boolean' || typeof n === 'bigint' || typeof n === 'symbol') {
    console.log(n);
  } else if (n === null) {
    console.log('null');
  } else if (n === undefined) {
    console.log('undefined');
  } else if (typeof n === 'function') {
    console.log(n.toString());
  } else if (Array.isArray(n)) {
    n.forEach(element => {
      console.log(element);
    });
  } else if (typeof n === 'object') {
    Object.keys(n).forEach(key => {
      console.log(`${key}: ${n[key]}`);
    });
  } else {
    console.log('Unknown type:', n);
  }
}



  function mathRound(num) {
    return Math.round(num * 100) / 100;
  }
  
  
function getXY(number,column){
  const x=(number-1)%column;
  const y=Math.floor((number-1)/column);
  return {x,y}
}
