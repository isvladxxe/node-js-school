import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Length, IsEmail } from 'class-validator';
import { User } from './user'

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 80 })
    @Length(10, 80)
    name: string;

    @Column({ length: 4096 })
    @Length(0, 4096)
    description: string

    date: Date

    @ManyToOne(type => User, user => user.books)
    user: User;
}
