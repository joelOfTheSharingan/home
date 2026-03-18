function reverseString(str) {
  return str.split('').reverse().join('');
}
function starter(s){
  while(String(s).includes("+-")||String(s).includes("--")){
    s=s.replace("+-","-")
    s=s.replace("--","+")
  }
  return s
}
function replaceAdd(s){
  if(String(s).includes("+")==false){
    return Number(s)
  }else{
    while(s.includes("+")){
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
    for(let i=Index-1;i<s.length;i--){
      if(s[i]=="."){
        n+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        n+=s[i]
      }
    }
    
    n=reverseString(n)
    s=s.replace(n+"+"+m,Number(n)+Number(m))
  }
}return s
}
function replaceMinus(s){
  if(String(s).includes("-")==false){
    return s
  }else{while(String(s).includes("-")){
    let m="";n=""
    let Index=s.indexOf("-")
    for(let i=Index+1;i>=0;i++){
      if(s[i]=="."){
        m+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        m+=s[i]
      }
    }
    for(let i=Index-1;i<s.length;i--){
      if(s[i]=="."){
        n+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        n+=s[i]
      }
    }
    n=reverseString(n)
    s=s.replace(n+"-"+m,Number(n)-Number(m))
  
  }}return s
}
function replaceTimes(s){
  if(String(s).includes("*")==false){
    return s
  }else{
    while(String(s).includes("*")){
    let m="";n=""
    let Index=s.indexOf("*")
    for(let i=Index+1;i>=0;i++){
      if(s[i]=="."){
        m+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        m+=s[i]
      }
    }
    for(let i=Index-1;i<s.length;i--){
      if(s[i]=="."){
        n+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        n+=s[i]
      }
    }
    
    n=reverseString(n)
    s=s.replace(n+"*"+m,Number(n)*Number(m))
    }
  }return s
}
function replaceDivide(s){
  if(String(s).includes("/")==false){
    return s
  }else{
    while(String(s).includes("/")){
    let m="";n=""
    let Index=s.indexOf("/")
    for(let i=Index+1;i>=0;i++){
      if(s[i]=="."){
        m+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        m+=s[i]
      }
    }
    for(let i=Index-1;i<s.length;i--){
      if(s[i]=="."){
        n+="."
      }else if(isNaN(Number(s[i]))){
        break
      }else{
        n+=s[i]
      }
    }
    
    n=reverseString(n)
    s=s.replace(n+"/"+m,Number(n)/Number(m))
    }
  }return s
}