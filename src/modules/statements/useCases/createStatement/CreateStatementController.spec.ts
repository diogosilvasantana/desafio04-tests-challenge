import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

import { app } from "../../../../app";

let connection: Connection;
let token: string;

describe("Create Statement", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("hardcore", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES ('${id}', 'John Doe', 'johndoe@example.com', '${password}', now(), now())`
    );

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "hardcore",
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create statement", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        description: "Pix",
        amount: 10,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
  });

  it("should to throw an error by balance < amount", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        description: "Saque",
        amount: 100,
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
  });
});
