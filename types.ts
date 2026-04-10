
export type RecipientRole = 'Needs to sign' | 'Needs to complete' | 'CC recipient' | 'Signs in person';

export interface Recipient {
  id: string;
  name: string;
  role: RecipientRole;
  email: string;
  customMessage?: string;
  avatar?: string;
  step?: number;
}

export interface Document {
  id: string;
  name: string;
}
