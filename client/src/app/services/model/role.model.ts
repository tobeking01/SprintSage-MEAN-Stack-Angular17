// Interface to define the structure of User
export interface Role {
  _id: string;
  name: 'Admin' | 'Professor' | 'Student';
  createdAt?: Date;
  updatedAt?: Date;
}
