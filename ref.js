function evaluateExpression(s) {
  let stack = [];
  let num = "";
  let sign = "+";
  for (let i = 0; i <= s.length; i++) {
    let c = s[i];
    if ((c >= "0" && c <= "9") || c === ".") {
      num += c;
    }
    if ("+-*/".includes(c) || i === s.length) {
      let n = Number(num);
      if (sign === "+") stack.push(n);
      if (sign === "-") stack.push(-n);
      if (sign === "*") stack.push(stack.pop() * n);
      if (sign === "/") stack.push(stack.pop() / n);
      sign = c;
      num = "";
    }
  }
  return stack.reduce((a, b) => a + b, 0);
}
const s="-5.4-96.7+89249+03-2*7.68/3"
console.log(evaluateExpression(s))
console.log(eval(s))