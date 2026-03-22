export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'COOK' | 'CASHIER' | 'CUSTOMER'
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'warning' },
  PREPARING: { label: 'Preparing', color: 'info' },
  READY: { label: 'Ready', color: 'success' },
  COMPLETED: { label: 'Completed', color: 'default' },
  CANCELLED: { label: 'Cancelled', color: 'danger' },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  RESTAURANT_ADMIN: 'Admin',
  COOK: 'Cook',
  CASHIER: 'Cashier',
  CUSTOMER: 'Customer',
}
