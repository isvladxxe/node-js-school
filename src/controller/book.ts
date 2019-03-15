import { BaseContext } from 'koa';
import { getManager, Repository, Not, Equal } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { Book } from '../entity/book';
import { User } from '../entity/user';

export default class BookController {

    public static async getUserBooks(ctx: BaseContext) {

        const booksRepository: Repository<Book> = getManager().getRepository(Book);
        const books: Book[] = await booksRepository.find({
            user: { id: +ctx.params.userId || 0 }
        });

        ctx.status = 200;
        ctx.body = books;
    }

    public static async createUserBook(ctx: BaseContext) {

        const userRepository: Repository<User> = getManager().getRepository(User);
        const user = await userRepository.findOne({ id: +ctx.params.userId || 0 });

        const booksRepository: Repository<Book> = getManager().getRepository(Book);

        const bookToBeSaved: Book = new Book();
        bookToBeSaved.user = user;
        bookToBeSaved.name = ctx.request.body.name;
        bookToBeSaved.description = ctx.request.body.description;
        bookToBeSaved.date = ctx.request.body.date;

        const errors: ValidationError[] = await validate(bookToBeSaved);

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
            return;
        } else if (!await userRepository.findOne({ id: bookToBeSaved.user.id })) {
            ctx.status = 400;
            ctx.body = `The user doesn't exist in the db`;
            return;
        }

        const book = await booksRepository.save(bookToBeSaved);
        ctx.status = 201;
        ctx.body = book;
    }

    public static async updateUserBook(ctx: BaseContext) {

        const bookRepository: Repository<Book> = getManager().getRepository(Book);

        const bookToBeUpdated: Book = new Book();
        bookToBeUpdated.id = +ctx.params.bookId || 0;
        bookToBeUpdated.name = ctx.request.body.name;
        bookToBeUpdated.description = ctx.request.body.description;
        bookToBeUpdated.date = ctx.request.body.date;

        const errors: ValidationError[] = await validate(bookToBeUpdated);

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = errors;
            return;
        } else if (!await bookRepository.findOne(bookToBeUpdated.id)) {
            ctx.status = 400;
            ctx.body = `The book you are trying to update doesn't exist in the db`;
            return;
        }

        const user = await bookRepository.save(bookToBeUpdated);
        ctx.status = 201;
        ctx.body = user;
    }

    public static async deleteUserBook(ctx: BaseContext) {

        const booksRepository = getManager().getRepository(Book);
        const bookToRemove: Book = await booksRepository.findOne(+ctx.params.bookId || 0);

        if (!bookToRemove) {
            ctx.status = 400;
            ctx.body = 'The book you are trying to delete doesn\'t exist in the db';
            return;
        }

        await booksRepository.remove(bookToRemove);
        ctx.status = 204;
    }
}
