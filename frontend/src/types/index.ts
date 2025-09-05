export interface Certificate {
  id: string;
  studentName: string;
  degreeTitle: string;
  issueDate: string;
  blockHash?: string;
  isValid?: boolean;
  status: 'active' | 'revoked';
  createdAt: string;
}

export interface Block {
  index: number;
  hash: string;
  previous_hash: string;
  timestamp: string;
  certificate_data: {
    certificate_id: string;
    student_name: string;
    degree: string;
    issue_date: string;
  };
}

export interface VerificationResult {
  isValid: boolean;
  certificate?: Certificate;
  message: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type Theme = 'light' | 'dark';