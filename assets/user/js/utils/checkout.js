
const form=document.getElementById('checkout-address');
  form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const name=document.getElementById('name').value.trim()
    const mobile=document.getElementById('mobile').value
    const address=document.getElementById('address').value.trim()
    const city=document.getElementById('city').value.trim()
    const state=document.getElementById('state').value.trim()
    const pincode=document.getElementById('pincode').value
    const error=document.getElementById('error');
    if(!name || !mobile || !address || !city || !state || !pincode){
      return error.innerText="Please fill all the fields"
    }

    if (!/^[a-z ,.'-]+$/i.test(name)) {
      return (error.innerText = "Invalid name");
    }
    if (!/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(mobile)) {
      return (error.innerText = "Invalid phone number");
    }
    if(!/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(pincode)){
      return (error.innerText = "Invalid pin code");
    }
    const rawData=await fetch('/add-address',{
      method:"POST",
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({name,mobile,city,address,state,pincode})
    })
    if(rawData.ok){
      const data=await rawData.json();
      if(data.status==="success"){
       return window.location.reload();
      }
    }
    return error.innerText="Something went wrong try again"
  })