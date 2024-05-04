import { Injectable } from '@nestjs/common';
import { MessageInterface } from './interface/message.interface';

@Injectable()
export class SocketMessageService {
  private messages: MessageInterface[] = [];

  addMessage(message: MessageInterface): void {
    this.messages.push(message);
  }

  getLastMessage(): MessageInterface | undefined {
    return this.messages[this.messages.length - 1];
  }
}
