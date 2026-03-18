function reverseString(str) {
  return str.split('').reverse().join('');
}
function replaceAdd(s){
  let test=0
  if(String(s).includes("+")==false){
    return s
  }else{
    while(s.includes("+")&&test<67){
      test++
    let m="";n=""
    let Index=s.indexOf("+")
    for(let i=Index+1;i<s.length;i++){
      if(s[i]=="."){
        m+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        m+=s[i]
      }
    }
    m=Number(m)
    for(let i=Index-1;i>=0;i--){
      if(s[i]=="."){
        n+="."
      }else if(s[i]==="m"||s[i]==="-"){
        n = Number(reverseString(n))
        let expr = n + "+" + m
        s = s.replace(expr, Number(n) + Number(m))
        break
      }
      else if(isNaN(Number(s[i]))){
        break
      }else if(s[i]==="-"){
        break
      }else{
        n+=s[i]
      }

    }
    console.log(s,m,n)
  }
}return s
}
function starter(s){
  if(s[0]==="-"){
    s=s.replace("-","m")
  }else if(s[0]==="+"){
    s=s.replace("+","")
  }
  while(String(s).includes("+-")||String(s).includes("--")||String(s).includes("+0")||String(s).includes("-0")){
    s=s.replace("+-","-")
    s=s.replace("--","+")
     s=s.replace("+0","")
    s=s.replace("-0","")
  }
  return s
}

function replaceMinus(s){
  let test=0
  if(String(s).includes("-")==false){
    return s
  }else{while(String(s).includes("-")&&test<67){
    s=starter(s)
    test++
    let m="";n=""
    let Index=s.indexOf("-")
    for(let i=Index+1;i<s.length;i++){
      if(s[i]=="."){
        m+="."
      
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        m+=s[i]
      }
    }
    for(let i=Index-1;i>=0;i--){
      if(s[i]=="."){
        n+="."
      }else if(s[i]==="m"){
        s=s.replace("m"+reverseString(n)+"-"+m,("m"+(Number(reverseString(n))+Number(m))))
        break
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        n+=s[i]
      }
    }
    n=Number(reverseString(n))
    m=Number(m)
      if(n>m){
          s=s.replace(n+"-"+m,n-m)
        }else if(n<m){
          s=s.replace(n+"-"+m,"m"+(m-n))
          //alert("Hello")
        }
  }}
  
s = s.replaceAll("m","-")
  
  return s
}
let s="-5.4-96.7+89249+03-2-7.68"
//console.log(Number(replaceAdd(replaceMinus(starter(s)))),1)
//console.log(replaceMinus(starter(s)),2)
//console.log((replaceAdd(replaceMinus(starter(s)))),3)
//console.log(replaceMinus(starter(s)),3)
console.log(Number(replaceMinus(replaceAdd(starter(s)))))
console.log(eval(s))