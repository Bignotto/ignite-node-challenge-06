import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferErrors";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    type,
    amount,
    description,
    sender_id,
  }: ICreateTransferDTO): Promise<Statement> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    const sender = await this.usersRepository.findById(sender_id);

    if (!sender) {
      throw new CreateTransferError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id,
    });

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const statementOperation = await this.statementsRepository.create({
      user_id,
      type,
      amount,
      description,
    });

    return statementOperation;
  }
}
