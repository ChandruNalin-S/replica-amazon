import {
  cart,
  removeFromCart, 
  updateQuantity,
  updateDeliveryOption,
} from '../../data/cart.js';
import {getProduct} from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';// the single dot denotes ,the file is in current folder.
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';// here we didn't give {} bracket because it is a default export and it only one function can be export from the file.
import {deliveryOptions, getDeliveryOption, calculateDeliveryDate} from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { renderCheckoutHeader } from './checkoutHeader.js';
// each file can only have 1 default export.

/*Calculate delivery date:
1-Get today's date.
2-Do calculations,like add 7 days.
3-Display the date in easy-to-read format.
*/

const today = dayjs();// dayjs() is a object, and is used for get today date and day with time.
const deliverDate = today.add(7,'days');// dayjs external library have some method called add(). it is used for add certain amount of time to the orginal time. and it takes two parameter, one is how much want to increase the time and second parameter is to, how many days or day.

console.log(deliverDate.format('dddd, MMMM D'));// dayjs have another method called format. it is used for formating the date, day and month in readable format for better understanding to other's. 



export function renderOrderSummary(){// this renderOrderSummary function is used for generate all the below code and to avoid reload the page when clicking deliveryOption in checkout page.
let cartSummaryHTML = '';// this variable is used to combine the html which was generated by javascript.
cart.forEach((cartItem)=>{

  const productId = cartItem.productId;// through the id, we can access of all corresponding data which is known as de-duplicating or normalizing the data, this will mostly using in software engineering. 

  const matchingProduct = getProduct(productId);

  //console.log(matchingProduct.id);

  const deliverOptionId = cartItem.deliveryOptionId;

  const deliveryOption = getDeliveryOption(deliverOptionId);

  const dateString = calculateDeliveryDate(deliveryOption);

  cartSummaryHTML += `
  <div class="cart-item-container 
  js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image"
          src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            ${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-link" data-product-id ="${matchingProduct.id}">
              Update
            </span>
            <input class="quantity-input js-quantity-input-${matchingProduct.id}">
            <span class="save-quantity-link link-primary js-save-link" data-product-id="${matchingProduct.id}">save</span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
${deliveryOptionsHTML(matchingProduct,cartItem)}   
        </div>
      </div>
    </div>
  `;
  //console.log(cartSummaryHTML);
});
//console.log(cartSummaryHTML);

function deliveryOptionsHTML(matchingProduct,cartItem){
  let html = '';
  deliveryOptions.forEach((deliveryOption)=>{
    
    const dateString = calculateDeliveryDate(deliveryOption);

    const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryOption.priceCents)}-`;

    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;


   html += 
   `<div class="delivery-option js-delivery-option" data-product-id="${matchingProduct.id}"
   data-delivery-option-id="${deliveryOption.id}">
      <input type="radio"
        ${isChecked ? 'checked' : ''}
        class="delivery-option-input"
        name="delivery-option-${matchingProduct.id}">
      <div>
        <div class="delivery-option-date">
          ${dateString}
        </div>
        <div class="delivery-option-price">
          ${priceString} Shipping
        </div>
      </div>
    </div>`
  });

  return html;
}


document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;



// delete/remove an item from the cart there are two steps;
/*
 1-> remove the product from the cart.
 2-> Update the html->there need some steps->
      1->use the DOM to get the element to remove.
      2-> use.remove() method is used for remove the html element from the page through the DOM.
  for example: const button = document.querySelector('button);
  button.remove();
*/

updateCartQuantity();

document.querySelectorAll('.js-delete-link').forEach((link)=>{
  link.addEventListener('click',()=>{
    const productId = link.dataset.productId;
    removeFromCart(productId);
    /*
    const container = document.querySelector(`.js-cart-item-container-${productId}`);

    //console.log(container);

    container.remove();// remove the html element from the page through the dom.
    */
    renderCheckoutHeader();
    renderOrderSummary();// regenerating the html after some interaction/interactive like click or delete.
    updateCartQuantity();
    renderPaymentSummary();
  });
});

/*
let cartQuantity = 0;

cart.forEach((cartItem) => {
  cartQuantity += cartItem.quantity;
});

document.querySelector('.js-return-to-home-link')
  .innerHTML = `${cartQuantity} items`;
*/

function updateCartQuantity(){
  //const cartQuantity = calculateCartQuantity();
  /*
  document.querySelector('.js-return-to-home-link')
    .innerHTML = `${cartQuantity} items`;
  */
 renderCheckoutHeader();
 renderPaymentSummary();
}


document.querySelectorAll('.js-update-link').forEach((link)=>{
  link.addEventListener('click',()=>{
    const productId = link.dataset.productId;
    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    container.classList.add('is-editing-quantity');
  })
})



  document.querySelectorAll('.js-save-link').forEach((link)=>{
    link.addEventListener('click',()=>{
      const productId = link.dataset.productId;

      const container = document.querySelector(`.js-cart-item-container-${productId}`);
      container.classList.remove('is-editing-quantity');
    
      const saveQuantity = document.querySelector(`.js-quantity-input-${productId}`);
  
      const newQuantity = Number(saveQuantity.value);

      if (newQuantity < 0 || newQuantity >= 1000)  {      
      alert('Quantity must be at least 0 and less than 1000');
      return;
      }
  
      updateQuantity(productId,newQuantity);

      const quantityLabel = document.querySelector(
        `.js-quantity-label-${productId}`
      );
      quantityLabel.innerHTML = newQuantity;

      updateCartQuantity();
      
    });
});


document.querySelectorAll('.js-delivery-option').forEach((element)=>{
  element.addEventListener('click',()=>{
    const {productId,deliveryOptionId} = element.dataset;//shorthand property
    updateDeliveryOption(productId,deliveryOptionId);
    renderOrderSummary();// A function can call / re-run itself is called recursion.
    renderPaymentSummary();
  });
});
}
// the above is for update the data and regenerate all the html. this technique is called "MVC"- Model-View-Controller.
//renderOrderSummary();//re-run all above code.



/*MVC-it is popular technique and basically using in software enginnering and they interact with each other in a loop.

 Split our code into 3 parts;

 1-Model-> saves and manages the data for example: in our project cart.js folder.

 2-View-> takes the data and display it on the page for example: in our project checkout.js folder.

 3-Controller->Runs some code when we interact with the page for example: in our project at the bottom of the checkout.js folder , for add a  addeventlistener to the deliveryOption in checkout page.when we click, it do some action takes place in webpage.  
 
 note: instead of updating a data by using dom, we can use MVC design pattern.
 
 MVC= makes sure the page always matches the data.
 
 MVC is a design pattern. it's a way to organize and design our code


*/












  








  


