export interface RfqContact {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  }

export interface RfqProject {
  name?: string;
  location?: string;
  targetDate?: string;
  needsInstallation: boolean;
  notes?: string;
}

export interface RfqItem {
  name: string;
  quantity: number;
  notes?: string;
}

export interface RfqSubmission {
  contact: RfqContact;
  project: RfqProject;
  items: RfqItem[];
  attachments?: File[];
}

export interface QAQuestion {
  productId: string;
  author: string;
  question: string;
}

export interface NewsletterSubscription {
  email: string;
}
