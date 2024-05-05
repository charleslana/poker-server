import { Injectable } from '@nestjs/common';
import { RoomInterface } from './interface/room.interface';

@Injectable()
export class SocketRoomService {
  private rooms: RoomInterface[] = [];

  addRoom(room: RoomInterface): void {
    this.rooms.push(room);
  }

  removeRoom(id: string): void {
    const index = this.rooms.findIndex((room) => room.id === id);
    if (index !== -1) {
      this.rooms.splice(index, 1);
    }
  }

  getAllRooms(): RoomInterface[] {
    return this.rooms;
  }

  getRoom(id: string): RoomInterface | undefined {
    return this.rooms.find((room) => room.id === id);
  }

  removeUserFromRoom(roomId: string, userId: string): boolean {
    const room = this.getRoom(roomId);
    if (room) {
      room.users = room.users.filter((user) => user.id !== userId);
      if (room.users.length === 0) {
        this.removeRoom(roomId);
        return true;
      }
      return false;
    }
    return false;
  }

  isRoomOwner(roomId: string, userId: string): boolean {
    const room = this.getRoom(roomId);
    return room ? room.users.some((user) => user.id === userId) : false;
  }

  updateRoomId(oldId: string, newId: string): void {
    const roomIndex = this.rooms.findIndex((room) => room.id === oldId);
    if (roomIndex !== -1) {
      this.rooms[roomIndex].id = newId;
    }
  }

  hasUserInAnyRoom(userId: string): boolean {
    return this.rooms.some((room) => this.isUserInRoom(room, userId));
  }

  private isUserInRoom(room: RoomInterface, userId: string): boolean {
    return room.users.some((user) => user.id === userId);
  }
}
