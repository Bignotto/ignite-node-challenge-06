import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateTransferUseCase } from "./CreateTransferUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { id: to_user } = request.params;

    const type = OperationType.TRANSFER;

    const createTransfer = container.resolve(CreateTransferUseCase);

    const statement = await createTransfer.execute({
      user_id: to_user,
      type,
      amount,
      description,
      sender_id: user_id,
    });

    return response.status(201).json(statement);
  }
}
