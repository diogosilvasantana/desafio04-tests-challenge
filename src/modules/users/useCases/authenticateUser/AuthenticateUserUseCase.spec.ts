import "reflect-metadata";
import "dotenv/config";

import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to authenticate user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "$2a$10$XFOYQTBqrCkXQ2izZ.71SuRVD2Qi8lTtGsu3.KHH46Trk.i.0U/gG",
    });
    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: "123456",
    });

    expect(auth).toHaveProperty("user");
    expect(auth).toHaveProperty("token");
  });

  it("should to throw an incorrect email or password, incorrect password", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      });
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "wrong",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should to throw an incorrect email or password, user not found", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "janedoe@example.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
