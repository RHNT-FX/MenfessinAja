import type { User, UserRole, UserStatus } from '@menfessin-aja/shared';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { isSupabaseConfigured, supabase } from '../config/supabase.js';

export interface UserEntity extends User {
  password_hash: string;
}

// In-Memory store untuk development/testing jika Supabase belum terkoneksi
const mockUsers: Map<string, UserEntity> = new Map();

// Seed initial users sesuai SDD 5 & skema migrasi 001
const defaultPasswordHash = bcrypt.hashSync('password123', 10);

mockUsers.set('admin@menfessinaja.ac.id', {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@menfessinaja.ac.id',
  password_hash: defaultPasswordHash,
  role: 'admin',
  status: 'active',
  created_at: new Date('2026-10-18T00:00:00Z').toISOString()
});

mockUsers.set('student@menfessinaja.ac.id', {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'student@menfessinaja.ac.id',
  password_hash: defaultPasswordHash,
  role: 'member',
  status: 'active',
  created_at: new Date('2026-10-18T00:00:00Z').toISOString()
});

export class UserRepository {
  static async findByEmail(email: string): Promise<UserEntity | null> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error('[UserRepository] Error querying Supabase:', error);
      } else if (data) {
        return data as UserEntity;
      }
    }

    return mockUsers.get(normalizedEmail) || null;
  }

  static async findById(id: string): Promise<UserEntity | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[UserRepository] Error querying Supabase by ID:', error);
      } else if (data) {
        return data as UserEntity;
      }
    }

    for (const user of mockUsers.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  static async create(payload: {
    email: string;
    password_hash: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<UserEntity> {
    const newUser: UserEntity = {
      id: crypto.randomUUID(),
      email: payload.email.toLowerCase().trim(),
      password_hash: payload.password_hash,
      role: payload.role || 'member',
      status: payload.status || 'active',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: newUser.id,
          email: newUser.email,
          password_hash: newUser.password_hash,
          role: newUser.role,
          status: newUser.status,
          created_at: newUser.created_at
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Gagal menyimpan user ke Supabase: ${error.message}`);
      }
      return data as UserEntity;
    }

    mockUsers.set(newUser.email, newUser);
    return newUser;
  }

  static async updateStatus(id: string, status: UserStatus): Promise<UserEntity | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data as UserEntity;
    }

    const user = await this.findById(id);
    if (user) {
      user.status = status;
      mockUsers.set(user.email, user);
      return user;
    }
    return null;
  }
}
