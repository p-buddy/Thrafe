export function longFunction() {
  const max = 100000000;
  let x = 0;
  console.time('Interval Time');
  while (x < max) {
    x += 1;
    const digits = x.toString().split('');
    if (digits[0] === '1' && digits.slice(1, digits.length).filter(n => n !== '0').length === 0) {
      console.log(x);
      console.timeEnd('Interval Time');
      if (x < max) {
        console.time('Interval Time');
      }
    }
  }
  console.log('done');
}