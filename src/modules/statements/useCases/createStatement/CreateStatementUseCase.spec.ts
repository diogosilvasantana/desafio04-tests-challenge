import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { Statement } from "../../entities/Statement";
import { AppError } from "../../../../shared/errors/AppError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create statement", async () => {
    const statement = new Statement();
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });
    Object.assign(statement, {
      type: "deposit",
      description: "Salário",
      amount: 10000,
      user_id: user.id,
    });
    const statementCreated = await createStatementUseCase.execute(statement);

    expect(statementCreated).toHaveProperty("id");
  });

  it("should to throw an error by user not found", () => {
    expect(async () => {
      const statement = new Statement();
      Object.assign(statement, {
        type: "deposit",
        description: "Salário",
        amount: 10000,
        user_id: "1",
      });
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should to throw an error by balance < amount", () => {
    expect(async () => {
      const statement = new Statement();
      const user = await inMemoryUsersRepository.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      });
      Object.assign(statement, {
        type: "withdraw",
        description: "Fatura",
        amount: 1000,
        user_id: user.id,
      });
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(AppError);
  });
});
