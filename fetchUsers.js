fetch('http://localhost:3000/api/users').then(res=>res.json()).then(res=>{
  res.forEach(u => {
    console.log(`Name: ${u.name}, Role: ${u.role}, ClassId: ${u.classId}, Incharge: ${u.isClassIncharge}`);
  });
}).catch(console.error);
