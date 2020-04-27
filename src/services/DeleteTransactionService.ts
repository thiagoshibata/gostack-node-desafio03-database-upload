import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute(id: RequestDTO): Promise<void> {
    const deleteRepository = getRepository(Transaction);

    const transaction = await deleteRepository.findOne(id);

    if (!transaction) {
      throw new AppError('Transaction does not exist');
    }

    await deleteRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
