const socket = io();

const cartLink = document?.getElementById("cart");
const hrefValue = cartLink?.getAttribute("href");
const cart = hrefValue?.match(/\/products\/carts\/(.+)/)[1];

const message = (message, gravity, position, color) => {
  return Toastify({
    text: `${message}`,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: `${gravity}`,
    position: `${position}`,
    stopOnFocus: true,
    style: {
      background: `${color}`,
    },
    onClick: function () {},
  }).showToast();
};

const addCart = async (id) => {
  try {
    const res = await fetch(`/api/carts/${cart}/product/${id}`, {
      method: "POST",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);

    // Mostrar notificación de éxito
    message("product add to cart successfully", "top", "right", "#008000");
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
};

const addProductToCart = async (id, prodCart) => {
  try {
    const res = await fetch(`/api/carts/${prodCart}/product/${id}`, {
      method: "POST",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);

    // Mostrar notificación de éxito
    message("product add to cart successfully", "top", "right", "#008000");
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
};

const deleteProduct = async (id) => {
  const userCart = window.location.pathname.match(/\/products\/carts\/(.+)/)[1];
  try {
    const res = await fetch(`/api/carts/${userCart}/product/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);
    else socket.emit("cartList", result);

    // Mostrar notificación de éxito
    message("product delete to cart successfully", "top", "right", "#ff0000");

  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
};

const purchaseProducts = async () => {
  const cartEmpty = window.location.pathname.match(
    /\/products\/carts\/(.+)/
  )[1];
  try {
    // Confirmación de la compra
    Swal.fire({
      title: "Confirm the purchase?",
      text: "Products out of stock will not be added to the purchase!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        window.location.href = `/api/payments/createCheckout`;
        /* setTimeout(() => {
          window.location.href = `/api/carts/${cartEmpty}/purchase`;
        }, 500); */
      }
    });
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
};

const cartBody = document.querySelector("#cartBody");
const generateProductHTML = (prod) => {
  return `<div class="card rounded-3 mb-4" style="position: relative;">
         <button class="btn btn-danger px-2 py-1 rounded-3" 
         style="position: absolute; top:0; right:0"
         onclick="deleteProduct('${prod.product._id}')"
         >X</button>
         <div class="card-body p-4">
           <div class="row d-flex justify-content-between align-items-center">
             <div class="col-md-2 col-lg-2 col-xl-2">
               <img src="/img/${prod.product.thumbnails[0]}" alt="${prod.product.title}" class="img-fluid" />
             </div>
             <div class="col-md-3 col-lg-3 col-xl-3">
               <p class="lead fw-normal mb-2">${prod.product.title}</p>
               <p><span class="text-muted">Category:
                 </span>${prod.product.category}</p>
             </div>
             <div class="col-md-3 col-lg-3 col-xl-2 d-flex flex-column text-center">
  
               <label class="fw-bold">Quantity</label>
               <input type="number" value=${prod.quantity} class="form-control form-control-sm text-center fw-bold"
                 readonly />
             </div>
             <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
               <h5 class="mb-0">$${prod.product.price}</h5>
             </div>
             <div class="col-md-1 col-lg-1 col-xl-1 text-end">
               <a href="#!" class="text-danger"><i class="fas fa-trash fa-lg"></i></a>
             </div>
           </div>
         </div>
       </div>`;
};

// Escucha el evento "updatedCarts" emitido por el servidor
socket.on("updatedCarts", (data) => {
  const productsHTML = data.payload.products
    .map((prod) => generateProductHTML(prod))
    .join("");

  if (data.payload.products.length > 0) {
    cartBody.innerHTML = `
    <div class="container h-100 py-5" id="cartBody">
    <div class="row d-flex justify-content-center align-items-center h-100">
      <div class="col-10">
  
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-normal mb-0 text-black">Shopping Cart</h3>
          <div>
            <p class="mb-0"><span class="text-muted">Sort by:</span>
              <a href="#!" class="text-body">price
                <i class="fas fa-angle-down mt-1"></i></a>
            </p>
          </div>
        </div>
        ${productsHTML}
        <div class="card">
          <div class="card-body text-center">
            <button type="button" class="btn btn-warning btn-block btn-lg" onclick="purchaseProducts()">Buy Now</button>
          </div>
        </div>
  
      </div>
    </div>
  </div>
    `;
  } else {
    cartBody.innerHTML = `
    <div class="container h-100 py-5 text-center">
      <h2 class="p-5">Cart Empty</h2>
    </div>`;
  }
});
