const should = require("should");
const sinon = require("sinon");
const userModel = require("./src/users/users.model");
const userController = require("./src/users/users.controllers.js");
const app = require("./app");
const request = require("supertest");

describe("Unit suitcase Example", () => {
  let server;

  const email = "anddonedmore@gmail.com";
  const password = "tomuchpasswords";

  beforeAll(() => {
    server = app.listen(3000, () => {
      console.log("Server running. Use our API on port: 3000");
    });
  });

  afterAll(() => {
    server.close();
  });

  jest.setTimeout(100000);
  it("should return 200 Success", async () => {
    await request(server)
      .put("/api/users/login")
      .set("Content-Type", "application/json")
      .send({ email: email, password: password })
      .expect(200);
  });

  it("should User Data with token", async () => {
    const res = await request(server)
      .put("/api/users/login")
      .set("Content-Type", "application/json")
      .send({ email: email, password: password });

    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.subscription).toEqual(expect.any(String));
    expect(res.body.user.email).toEqual(email);
  });
});
