import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { Statement } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement operation", async () => {
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
    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: statement.id || "",
      user_id: user.id || "",
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("should to throw an error by user not found", () => {
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
      await getStatementOperationUseCase.execute({
        statement_id: statement.id || "",
        user_id: "1",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should to throw an error by statement not found", () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "123456",
      });
      await getStatementOperationUseCase.execute({
        statement_id: "1",
        user_id: user.id || "",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
