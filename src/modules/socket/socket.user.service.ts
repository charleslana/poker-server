import { Injectable } from '@nestjs/common';
import { UserInterface } from './interface/user.interface';

@Injectable()
export class SocketUserService {
  private users: UserInterface[] = [];

  addUser(user: UserInterface): void {
    if (!this.userExists(user.id)) {
      this.users.push(user);
    }
  }

  removeUser(id: string): void {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  getAllUsers(): UserInterface[] {
    return this.users;
  }

  getUser(id: string): UserInterface | undefined {
    return this.users.find((user) => user.id === id);
  }

  updateUserName(id: string, newName: string): void {
    const user = this.getUser(id);
    if (user) {
      user.name = newName;
    }
  }

  updateUserOriginalId(id: string, originalId: number): void {
    const user = this.getUser(id);
    if (user) {
      user.originalId = originalId;
    }
  }

  userOriginalIdExists(originalId: number): boolean {
    return this.users.some((user) => user.originalId === originalId);
  }

  private userExists(id: string): boolean {
    return this.users.some((user) => user.id === id);
  }
}
