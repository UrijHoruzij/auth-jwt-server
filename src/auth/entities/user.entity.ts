import { Entity, ObjectId, ObjectIdColumn, Column } from 'typeorm';

@Entity()
export class User {
  @ObjectIdColumn() id: ObjectId;
  @Column() email: string;
  @Column() password: string;
  @Column() name: string;
  @Column() lastname?: string;

  constructor(user?: Partial<User>) {
    Object.assign(this, user);
  }
}
