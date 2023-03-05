import "reflect-metadata";

import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@example.com",
      password: "123456",
    });
    const profile = await showUserProfileUseCase.execute(user.id || "");

    expect(profile).toHaveProperty("id");
  });

  it("should to throw a show user profile error", () => {
    expect(async () => {
      await showUserProfileUseCase.execute("1");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
