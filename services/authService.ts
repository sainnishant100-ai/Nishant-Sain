
import { User } from '../types';

const STORAGE_KEY = 'lumina_users';
const SESSION_KEY = 'lumina_active_user';

export class AuthService {
  static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static async login(email: string, password?: string): Promise<User> {
    await new Promise(r => setTimeout(r, 1000)); // Simulate network
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error("User sequence not found in neural database.");
    }
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }

  static async signup(name: string, email: string): Promise<User> {
    await new Promise(r => setTimeout(r, 1000));
    const users = this.getUsers();
    
    if (users.some(u => u.email === email)) {
      throw new Error("Email already registered in the cluster.");
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedAt: Date.now(),
      stats: { totalVideos: 0, totalImages: 0 }
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  }

  static async googleLogin(): Promise<User> {
    await new Promise(r => setTimeout(r, 1500));
    // Simulate successful Google OAuth
    return this.signup("Nexus User", `user_${Math.floor(Math.random()*1000)}@gmail.com`);
  }

  static getActiveUser(): User | null {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  }

  static logout() {
    localStorage.removeItem(SESSION_KEY);
  }
}
