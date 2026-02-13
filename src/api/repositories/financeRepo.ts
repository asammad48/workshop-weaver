import { 
  Client, 
  ExpenseCreateRequest, 
  ExpenseResponseApiResponse, 
  ExpenseResponsePageResponseApiResponse, 
  WagePayRequest, 
  WagePayResponseApiResponse, 
  WagePayResponsePageResponseApiResponse 
} from '@/api/generated/apiClient';
import { createClient } from './_repoBase';
import { normalizeError } from './_errors';

const client = createClient(Client);

export const financeRepo = {
  async listExpenses(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string, from?: Date, to?: Date): Promise<ExpenseResponsePageResponseApiResponse> {
    try {
      return await client.expensesGET(pageNumber, pageSize, search, sortBy, sortDirection, from, to);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async createExpense(body: ExpenseCreateRequest): Promise<ExpenseResponseApiResponse> {
    try {
      return await client.expensesPOST(body);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async listWages(pageNumber?: number, pageSize?: number, search?: string, sortBy?: string, sortDirection?: string, from?: Date, to?: Date): Promise<WagePayResponsePageResponseApiResponse> {
    try {
      return await client.wages(pageNumber, pageSize, search, sortBy, sortDirection, from, to);
    } catch (error) {
      throw normalizeError(error);
    }
  },

  async payWage(body: WagePayRequest): Promise<WagePayResponseApiResponse> {
    try {
      return await client.pay(body);
    } catch (error) {
      throw normalizeError(error);
    }
  }
};
