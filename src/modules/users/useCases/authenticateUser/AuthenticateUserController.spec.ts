import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("hardcore", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES ('${id}', 'John Doe', 'johndoe@example.com', '${password}', now(), now())`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "hardcore",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should be not authenticate user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "johndoe@example.com",
      password: "wrong_password",
    });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty("token");
  });
});
