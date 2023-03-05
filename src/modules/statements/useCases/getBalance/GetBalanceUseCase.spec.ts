import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { Statement } from "../../entities/Statement";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance", async () => {
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
    await inMemoryStatementsRepository.create(statement);
    const statementGetted = await getBalanceUseCase.execute({
      user_id: user.id || "",
    });

    expect(statementGetted).toHaveProperty("statement");
    expect(statementGetted).toHaveProperty("balance");
  });

  it("should to throw a get balancer error", () => {
    expect(async () => {
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
      await inMemoryStatementsRepository.create(statement);
      await getBalanceUseCase.execute({
        user_id: "1",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
