import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  integer,
  date,
  boolean,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const userRoleEnum = pgEnum('user_role', ['admin', 'user'])
export const leadStatusEnum = pgEnum('lead_status', [
  'NEW',
  'IN_PROGRESS',
  'LOST',
  'WON',
  'BORTFALT',
])
export const emailModeEnum = pgEnum('email_mode', ['FORWARDED', 'BCC'])
export const eventEntityEnum = pgEnum('event_entity', ['company', 'contact', 'lead'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  emailDomain: text('email_domain'),
  contactEmail: text('contact_email'),
  description: text('description'),
  createdByUserId: integer('created_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  role: text('role'),
  phone: varchar('phone', { length: 50 }),
  linkedInUrl: text('linkedin_url'),
  description: text('description'),
  createdByUserId: integer('created_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const contactEmails = pgTable('contact_emails', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const contactCompanyHistory = pgTable('contact_company_history', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id')
    .notNull()
    .references(() => contacts.id, { onDelete: 'cascade' }),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
})

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  description: text('description').notNull(),
  status: leadStatusEnum('status').notNull().default('NEW'),
  createdByUserId: integer('created_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  leadId: integer('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  createdByUserId: integer('created_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const emails = pgTable('emails', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  subject: text('subject'),
  recipientCompanyId: integer('recipient_company_id').references(() => companies.id, {
    onDelete: 'cascade',
  }),
  recipientContactId: integer('recipient_contact_id').references(() => contacts.id, {
    onDelete: 'cascade',
  }),
  sourceUserId: integer('source_user_id').references(() => users.id, { onDelete: 'set null' }),
  mode: emailModeEnum('mode').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const followups = pgTable('followups', {
  id: serial('id').primaryKey(),
  note: text('note').notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }).notNull(),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  leadId: integer('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
  createdByUserId: integer('created_by_user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  entity: eventEntityEnum('entity').notNull(),
  entityId: integer('entity_id').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  leads: many(leads),
  comments: many(comments),
  emails: many(emails),
  followups: many(followups),
}))

export const companiesRelations = relations(companies, ({ many }) => ({
  contacts: many(contacts),
  leads: many(leads),
  comments: many(comments),
  emails: many(emails),
  followups: many(followups),
  history: many(contactCompanyHistory),
}))

export const contactsRelations = relations(contacts, ({ many }) => ({
  leads: many(leads),
  comments: many(comments),
  emails: many(emails),
  history: many(contactCompanyHistory),
  contactEmails: many(contactEmails),
}))

export const contactEmailsRelations = relations(contactEmails, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactEmails.contactId],
    references: [contacts.id],
  }),
}))

export const leadsRelations = relations(leads, ({ one, many }) => ({
  company: one(companies, {
    fields: [leads.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [leads.contactId],
    references: [contacts.id],
  }),
  comments: many(comments),
}))
