export interface PageOut<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface MessageOut {
  detail: string;
}

export interface FieldError {
  field: string;
  message: string;
  type: string;
}

export interface ValidationErrorOut extends MessageOut {
  errors: FieldError[];
}
