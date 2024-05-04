import { Injectable } from '@nestjs/common';
import { UserInterface } from './interface/user.interface';

@Injectable()
export class SocketUserService {
  private users: UserInterface[] = [];

  addUser(user: UserInterface): void {
    this.users.push(user);
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
}
