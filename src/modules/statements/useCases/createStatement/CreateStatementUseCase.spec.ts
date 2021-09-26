import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUser: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
    createUser = new CreateUserUseCase(userRepository);
  });

  it("should be able to create a new statement", async () => {
    const testUser: ICreateUserDTO = {
      name: "test dude",
      email: "test@test.com",
      password: "12345",
    };

    const user = await createUser.execute(testUser);

    const testData: ICreateStatementDTO = {
      amount: 100,
      description: "initial balance",
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
    };

    const statement = await createStatementUseCase.execute(testData);

    expect(statement).toHaveProperty("id");
  });

  // TODO: cant create with invalid user
  it("should not be able to create a new statement with invalid user", async () => {
    // const testUser: ICreateUserDTO = {
    //   name: "test dude",
    //   email: "test@test.com",
    //   password: "12345",
    // };

    // const user = await createUser.execute(testUser);

    const testData: ICreateStatementDTO = {
      amount: 100,
      description: "initial balance",
      user_id: "invalid",
      type: OperationType.DEPOSIT,
    };

    // expect(async () => {
    //   await createStatementUseCase.execute(testData);
    // }).rejects.toHaveProperty("statusCode");

    const statement = await createStatementUseCase.execute(testData);
    console.log({ statement });
  });

  // TODO: cant create without balance (balance <= 0)
});
