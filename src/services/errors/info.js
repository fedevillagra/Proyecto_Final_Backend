
export const generateProductErrorInfo = (product) => {
  return `
    One or more parameters are incomplete or invalid.
    List of required properties:
        - title: Must be a string. (${product.title})
        - price: Must be a number. (${product.price})
    `;
};

export const generateProductAddCartErrorInfo = (product) => {
  return `Product not found with ${product._id}`;
};

export const generateCartErrorInfo = (cart) => {
  return `The cart with id ${cart._id} does not exist`;
};
