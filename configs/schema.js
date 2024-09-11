export const { pgTable, serial, text, varchar, numeric } = require("drizzle-orm/pg-core");

export const quizes=pgTable('quizes',{
    id:serial('id').primaryKey(),
    title:text('title').notNull(),
    content:text('content').notNull(),
    quiz:text("quiz"),
    correctAns:numeric('correctAnswers'),
    createBy:varchar('createdBy').notNull()
})