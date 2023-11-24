const btnMinus=document.querySelectorAll('[data-btnCartMinus]');
const btnPlus=document.querySelectorAll('[data-btnCartPlus]');
const cartConfirm=document.querySelectorAll('[data-cartConfirm]')
const cartModal=document.querySelector('#cart-modal');

// funcion for change cart quantity
const changeCartQuantity=async(event,operation)=>{
    try {
        const productId=event.currentTarget.dataset.id
        const input = document.querySelector(`[data-input="${productId}"]`)
        const total = document.querySelectorAll(`[data-total]`)
        const price = document.querySelector(`[data-prodAmount="${productId}"]`)
        //exiting when try to decrease quantity below zero
        if(input.value<=1 && operation === -1){
            return false
        }
        const rawData = await fetch("/change-cart-quantity",{
            method:"PATCH",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                productId,
                operation,
                curQuantity:input.value
            })
        })
    if(rawData.ok){
        const data=await rawData.json();
        if(data?.status==="success"){
            console.log(data);
            input.value=data?.data?.product?.quantity ?? input.value
            total[0].innerText=data.data.total
            total[1].innerText=data.data.total
            price.innerText=data.data.price
        }
    }

    } catch (error) {
       console.error(error.message) 
    }
}

const showCartModal =(event)=>{
    const productId = event.currentTarget.dataset.id
    cartModal.style.display="block"

}

const removeFromCart=async(event)=>{
    try {
        const productId=event.currentTarget.dataset.id;
        const row=document.querySelector(`[data-cartCard="${productId}"]`);
        const rawData=await fetch('/cart-remove',{
            method:"DELETE",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({productId}),
        })
        if(rawData.ok){
            const data=await rawData.json();
            if(data.status==="success"){
                
            }
        }
    } catch (error) {
        console.log()
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

cartConfirm.forEach((item)=>{
    item.addEventListener('click',showCartModal);
})