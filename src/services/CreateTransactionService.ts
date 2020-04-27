// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('You do not have enough balance', 400);
    }

    // buscando categoria
    let transactionCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    // Verificando se existe, e criando caso não exista
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      // criando categoria
      await categoryRepository.save(transactionCategory);
    }
    // criando transação com a categoria já existente
    const transaction = await transactionRepository.create({
      title,
      value,
      type,
      category_id: transactionCategory.id,
    });
    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
