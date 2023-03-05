import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  beforeEach(async () => {
    connection.query("DELETE FROM USERS;");
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Will Doe",
      email: "willdoe@example.com",
      password: "hardcore",
    });

    expect(response.status).toBe(201);
  });

  it("should to throw an error by user exists", async () => {
    const id = uuid();
    const password = hash("hardcore", 8);
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES ('${id}', 'Will Doe', 'willdoe@example.com', '${password}', now(), now())`
    );
    const response = await request(app).post("/api/v1/users").send({
      name: "Will Doe",
      email: "willdoe@example.com",
      password: "hardcore",
    });

    expect(response.status).toBe(400);
  });
});
