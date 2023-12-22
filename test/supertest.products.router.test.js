import chai from "chai";
import supertest from "supertest";
import {
  PORT,
  SIGNED_COOKIE_KEY,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from "../src/config/config.js";
import { faker } from "@faker-js/faker";

const expect = chai.expect;
const requester = supertest(`http://localhost:${PORT}`);

describe("Testing E-Commerce - Rutas de productos", () => {
  let cookie;
  const user = {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  };
  const newProduct = {
    title: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price({ min: 100, max: 1000 }),
    code: faker.string.alphanumeric(8),
    category: faker.commerce.productName(),
    stock: faker.number.int(50),
    status: faker.datatype.boolean(),
  };
  it("Debe loggear un usuario para ver los productos", async () => {
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

  it("El Endpoint GET /api/products debe devolver todos los productos", async () => {
    const response = await requester
      .get("/api/products")
      .set("Cookie", [`${cookie.name}=${cookie.value}`]);
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.be.an('array');
    expect(response.body.payload).to.have.lengthOf.above(0);
  });

  it("El Endpoint GET /api/products/:id debe devolver un producto por su ID", async () => {
    const pid = "64e01ca610c9f7e84cd2b2f0";
    const response = await requester
      .get(`/api/products/${pid}`)
      .set("Cookie", [`${cookie.name}=${cookie.value}`]);
    expect(response.status).to.equal(200);
    expect(response.body.payload).to.have.property("_id").equal(pid);
    expect(response.body.payload).to.have.property("title");
  });

  it("El Endpoint POST /api/products debe crear un nuevo producto", async () => {
    const response = await requester
      .post("/api/products")
      .set("Cookie", [`${cookie.name}=${cookie.value}`])
      .send(newProduct);
    expect(response.status).to.equal(201);
    expect(response.body.payload).to.have.property("_id");
    expect(response.body.payload).to.have.property("title").equal(newProduct.title);
  });
});
