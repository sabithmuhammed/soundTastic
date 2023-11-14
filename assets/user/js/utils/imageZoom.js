const container =document.querySelector('.image-div')
const image =document.querySelector('.image-div img')
const lens =document.querySelector('.lens');
const zoom =document.querySelector('.zoom');


container.addEventListener('mousemove',move)
lens.addEventListener('mousemove',move)
container.addEventListener('mouseout',remove)
lens.addEventListener('mouseout',remove)
function move(e){
    const container_rect=container.getBoundingClientRect();
    
    let x=e.pageX-container_rect.left-lens.offsetWidth/2;
    let y=e.pageY-container_rect.top-lens.offsetHeight/2;
   let maxX=container_rect.width-lens.offsetWidth;
   let maxY=container_rect.height-lens.offsetHeight;
    if(x>maxX)x=maxX
    if(x<0) x=0

    if(y>maxY)y=maxY
    if(y<0)y=0

    lens.style.cssText=`top: ${y}px; left: ${x}px;`
    let cx=container_rect.width/lens.offsetWidth;
    let cy=container_rect.height/lens.offsetHeight;
    zoom.style.cssText=`
    background: url(${image.src}) -${x*cx}px -${y*cy}px /
    ${container_rect.width * cx}px ${container_rect.height * cy}px
    no-repeat;
    `
    lens.classList.add('lens-active');
    zoom.classList.add('zoom-active')
}

function remove(){
    lens.classList.remove('lens-active')
    zoom.classList.remove('zoom-active')

}

function changeImage(item){
    const imageThumb =document.querySelectorAll('.image-thumb img');
    imageThumb.forEach((item)=>{
        item.classList.remove('image-thumb-active');
    })
    image.src=item.src;
    item.classList.add('image-thumb-active')
}