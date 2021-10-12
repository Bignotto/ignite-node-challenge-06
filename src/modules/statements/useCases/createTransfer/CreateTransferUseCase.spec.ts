import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateTransferError } from "./CreateTransferErrors";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

let userRepository: InMemoryUsersRepository;
let statementRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUser: CreateUserUseCase;
let createTransferUseCase: CreateTransferUseCase;

let from_user: User;
let to_user: User;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

describe("Create Transfer Use Case", () => {
  beforeEach(async () => {
    userRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      userRepository,
      statementRepository
    );
    createUser = new CreateUserUseCase(userRepository);

    createTransferUseCase = new CreateTransferUseCase(
      userRepository,
      statementRepository
    );

    const user1: ICreateUserDTO = {
      name: "from dude",
      email: "from@test.com",
      password: "12345",
    };

    const user2: ICreateUserDTO = {
      name: "to dude",
      email: "to@test.com",
      password: "12345",
    };

    from_user = await createUser.execute(user1);
    to_user = await createUser.execute(user2);
  });

  it("should be able to create a transfer from a user to another", async () => {
    const testData: ICreateStatementDTO = {
      amount: 100,
      description: "initial balance",
      user_id: from_user.id as string,
      type: OperationType.DEPOSIT,
    };
    await createStatementUseCase.execute(testData);

    const transferData: ICreateTransferDTO = {
      amount: 100,
      description: "test transfer",
      user_id: to_user.id as string,
      type: OperationType.TRANSFER,
      sender_id: from_user.id as string,
    };
    const transfer = await createTransferUseCase.execute(transferData);

    expect(transfer).toHaveProperty("id");
    expect(transfer).toHaveProperty("sender_id");
    expect(transfer.sender_id).toEqual(from_user.id);
  });

  it("should not be able to create a transfer from a user without funds", async () => {
    const testData: ICreateStatementDTO = {
      amount: 100,
      description: "initial balance",
      user_id: from_user.id as string,
      type: OperationType.DEPOSIT,
    };
    await createStatementUseCase.execute(testData);

    const transferData: ICreateTransferDTO = {
      amount: 101,
      description: "test transfer",
      user_id: to_user.id as string,
      type: OperationType.TRANSFER,
      sender_id: from_user.id as string,
    };

    expect(async () => {
      await createTransferUseCase.execute(transferData);
    }).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
  });

  it("should not be able to transfer to an invalid user", async () => {
    const transferData: ICreateTransferDTO = {
      amount: 100,
      description: "test transfer",
      user_id: "invalid user",
      type: OperationType.TRANSFER,
      sender_id: from_user.id as string,
    };

    expect(async () => {
      await createTransferUseCase.execute(transferData);
    }).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it("should not be able to transfer from an invalid user", async () => {
    const transferData: ICreateTransferDTO = {
      amount: 100,
      user_id: to_user.id as string,
      description: "test transfer",
      type: OperationType.TRANSFER,
      sender_id: "invalid user",
    };

    expect(async () => {
      await createTransferUseCase.execute(transferData);
    }).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });
});
