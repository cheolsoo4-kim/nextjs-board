import { pgTable, serial, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  avatar: varchar('avatar', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Boards table
export const boards = pgTable('boards', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  allowGuest: boolean('allow_guest').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Posts table
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  content: text('content').notNull(),
  boardId: integer('board_id').references(() => boards.id).notNull(),
  authorId: integer('author_id').references(() => users.id),
  author: varchar('author', { length: 100 }).notNull(),
  isGuest: boolean('is_guest').default(false).notNull(),
  views: integer('views').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  postId: integer('post_id').references(() => posts.id).notNull(),
  authorId: integer('author_id').references(() => users.id),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  isGuest: boolean('is_guest').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Todos table
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description'),
  completed: boolean('completed').default(false).notNull(),
  priority: varchar('priority', { length: 20 }).default('medium').notNull(),
  dueDate: timestamp('due_date'),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Guestbook table
export const guestbook = pgTable('guestbook', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  message: text('message').notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  todos: many(todos),
}))

export const boardsRelations = relations(boards, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  board: one(boards, {
    fields: [posts.boardId],
    references: [boards.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}))

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}))
