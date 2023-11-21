const btnMinus=document.querySelectorAll('[data-btnCartMinus]');
const btnPlus=document.querySelectorAll('[data-btnCartPlus]');

const changeCartQuantity=async(event,operation)=>{
    try {
        const productId=event.currentTarget.dataset.id
        const input = document.querySelector(`[data-input="${productId}"]`)
        const total = document.querySelectorAll(`[data-total]`)
        const rawData = await fetch("/change-cart-quantity",{
            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                productId,
                operation
            })
        })
    if(rawData.ok){
        const data=await rawData.json();
        if(data?.status==="success"){
            console.log(data);
            input.value=data?.data?.product?.quantity ?? input.value
            total[0].innerText=data?.total ?? total[0].innerText
            total[1].innerText=data?.total ?? total[1].innerText
        }
    }

    } catch (error) {
       console.error(error.message) 
    }
}

btnMinus.forEach((item)=>{
    item.addEventListener('click',(event)=>{
        changeCartQuantity(event,-1)
    })
})
btnPlus.forEach((item)=>{
    item.addEventListener('click',(event)=>{
        changeCartQuantity(event,1)
    })
})