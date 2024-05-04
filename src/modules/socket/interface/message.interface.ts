import { UserInterface } from './user.interface';

export interface MessageInterface {
  message: string;
  date: Date;
  user: UserInterface;
}
