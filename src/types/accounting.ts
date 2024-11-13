export interface AccountingEntry {
  id: string
  transaction_date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  created_at: string
  updated_at: string
}

export interface NewAccountingEntry {
  transaction_date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
} 