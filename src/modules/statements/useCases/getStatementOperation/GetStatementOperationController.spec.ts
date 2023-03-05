import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

import { app } from "../../../../app";

let connection: Connection;
let token: string;
let statementId: string;

describe("Get Statement Operation", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const userId = uuid();
    const password = await hash("hardcore", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES ('${userId}', 'John Doe', 'janedoe@example.com', '${password}', now(), now());`
    );

    statementId = uuid();
    await connection.query(`
      INSERT INTO STATEMENTS (id, user_id, description, amount, type, created_at, updated_at) VALUES ('${statementId}', '${userId}', 'Pix', 10, 'deposit', now(), now());
    `);

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "janedoe@example.com",
      password: "hardcore",
    });

    token = responseToken.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not find statement", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/d2e510e4-09cf-47c3-b719-ae6422660551`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
