import { inject, injectable } from 'tsyringe'

import { IUsersRepository } from '../../../users/repositories/IUsersRepository'
import { IStatementsRepository } from '../../repositories/IStatementsRepository'
import { OperationType } from '../../entities/Statement'
import { CreateTransferError } from './CreateTransferError'

interface IRequest {
  sender_id: string
  recipient_id: string
  amount: number
  description: string
}

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ sender_id, recipient_id, amount, description }: IRequest) {
    const sender = await this.usersRepository.findById(sender_id)

    if (!sender) {
      throw new CreateTransferError.SenderUserNotFound()
    }

    const recipient = await this.usersRepository.findById(recipient_id)

    if (!recipient) {
      throw new CreateTransferError.RecipientUserNotFound()
    }

    const { balance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    })

    if (balance < amount) {
      throw new CreateTransferError.InsufficientFunds()
    }

    await this.statementsRepository.create({
      user_id: recipient_id,
      sender_id,
      description,
      amount,
      type: OperationType.TRANSFER
    })

    const transfer = await this.statementsRepository.create({
      user_id: sender_id,
      sender_id,
      description,
      amount,
      type: OperationType.TRANSFER
    })

    return transfer
  }
}
