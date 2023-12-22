import chai from "chai";
import supertest from "supertest";
import { PORT, SIGNED_COOKIE_KEY } from "../src/config/config.js";

const expect = chai.expect;
const requester = supertest(`http://localhost:${PORT}`);

describe("Testing E-Commerce - Rutas de Carrito", () => {
  let cookie;
  const user = {
    email: "cliente@gmail.com",
    password: "1234",
  };
  const userCart = "65234be7d3f2bbcfe335e4f2";
  const productID = "64e01ca610c9f7e84cd2b2f0";

  it("Debe loggear un usuario para ver su carrito", async () => {
    const result = await requester.post("/api/jwt/login").send(user);
    const cookieResult = result.headers["set-cookie"][0];
    expect(cookieResult).to.be.ok;
    cookie = {
      name: cookieResult.split("=")[0],
      value: cookieResult.split("=")[1],
    };
    expect(cookie.name).to.be.ok.and.eql(SIGNED_COOKIE_KEY);
    expect(cookie.value).to.be.ok;
  });

  it("El Endpoint GET /api/carts/:id debe devolver un carrito por su ID", async () => {
    const response = await requester
      .get(`/api/carts/${userCart}`)
      .set("Cookie", [`${cookie.name}=${cookie.value}`]);
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.have.property("_id").equal(userCart);
  });

  it("El Endpoint POST /api/carts/:cid/product/:pid debe agregar un producto seleccionado al carrito de el usuario", async () => {
    const response = await requester
      .post(`/api/carts/${userCart}/product/${productID}`)
      .set("Cookie", [`${cookie.name}=${cookie.value}`]);
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.have.property("_id").equal(userCart);
  });

  it("El Endpoint DELETE /api/carts/:cid/product/:pid debe eliminar el producto seleccionado en el carrito del usuario", async () => {
    const response = await requester
      .delete(`/api/carts/${userCart}/product/${productID}`)
      .set("Cookie", [`${cookie.name}=${cookie.value}`]);
    expect(response.status).to.equal(200);
  })
});
