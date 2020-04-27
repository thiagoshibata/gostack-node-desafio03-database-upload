import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

// Rota de listagem de transações e balanço
transactionsRouter.get('/', async (request, response) => {
  // -- Balance --
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const balance = await transactionRepository.getBalance();
  // -- End Balance --

  // Transactions
  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  // -- End Transactons

  return response.status(200).json({ transactions, balance });
});

// Rota de criação de uma transação
transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(200).json(transaction);
});

// Rota para detar uma transação
transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransection = new DeleteTransactionService();

  await deleteTransection.execute({ id });

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute(request.file.path);

    return response.status(200).json(transactions);
  },
);

export default transactionsRouter;
