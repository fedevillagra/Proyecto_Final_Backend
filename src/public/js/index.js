const socket = io();

const form = document.getElementById("form");
const productsTable = document.querySelector("#productsTable");
const tbody = productsTable.querySelector("#tbody");

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

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obtener los datos del formulario
  const formData = new FormData(form);
  const res = await fetch(form.action, {
    method: "POST",
    body: formData,
  });
  try {
    if (!res.ok) {
      throw new Error(res.error);
    } else {
      // Obtener la lista actualizada de productos desde el servidor
      const resultProducts = await fetch("/api/products?limit=100");
      const results = await resultProducts.json();
      if (results.status === "error") {
        throw new Error(results.error);
      } else {
        // Emitir el evento "productList" con la lista de productos actualizada
        socket.emit("productList", results.payload);

        // Mostrar notificación de éxito
        message("new product added successfully", "top", "right", "#008000");
        // Restablecer los campos del formulario
        form.reset();
      }
    }
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
});

// Función para eliminar un producto
const deleteProduct = async (id) => {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.status === "error") throw new Error(result.error);
    else socket.emit("productList", result.payload);

    // Mostrar notificación de éxito
    message("product removed successfully", "bottom", "right", "#ff0000");
    
  } catch (error) {
    message(`${error}`, "bottom", "center", "#ff0000");
  }
};

// Escucha el evento "updatedProducts" emitido por el servidor
socket.on("updatedProducts", (products) => {
  // Limpiar el contenido de tbody
  tbody.innerHTML = "";
  // console.log(products);
  // Agregar los nuevos productos a tbody
  products.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.title}</td>
        <td>${item.description}</td>
        <td>${item.price}</td>
        <td>${item.code}</td>
        <td>${item.category}</td>
        <td>${item.stock}</td>
        <td class="d-flex justify-content-between">
          <button class="btn btn-danger mx-1" onclick="deleteProduct('${item._id}')" id="btnDelete">Delete</button>
          <button class="btn btn-info mx-1" onclick="updatedProduct('${item._id}')" id="btnUpdate">Update</button>
        </td>
        <td id="editForm_${item._id}" style="display: none;">
          <div class="product-edit-form">
            <label for="editStock">New Stock:</label>
            <input type="number" id="editStock_${item._id}" />
            <button class="btn btn-info" onclick="updateStock('${item._id}')">Update Stock</button>
          </div>
        </td>
      `;
    tbody.appendChild(row);
  });
});
