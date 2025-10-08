export interface RegisterResult {
  success: boolean;
  message: string;
  user: User;
  session: null;
}

export interface User {
  id: string;
  aud: string;
  role: string;
  email: string;
  phone: string;
  confirmation_sent_at: Date;
  app_metadata: AppMetadata;
  user_metadata: Data;
  identities: Identity[];
  created_at: Date;
  updated_at: Date;
  is_anonymous: boolean;
}

export interface AppMetadata {
  provider: string;
  providers: string[];
}

export interface Identity {
  identity_id: string;
  id: string;
  user_id: string;
  identity_data: Data;
  provider: string;
  last_sign_in_at: Date;
  created_at: Date;
  updated_at: Date;
  email: string;
}

export interface Data {
  email: string;
  email_verified: boolean;
  full_name: string;
  phone_verified: boolean;
  sub: string;
  user_type: string;
  username: string;
}
