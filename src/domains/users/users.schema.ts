import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email('Email inválido'),
  firstName: z.string().min(2, 'El nombre es muy corto'),
  lastName: z.string().min(2, 'El apellido es muy corto'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  isActive: z.boolean().default(true),
  profileIds: z.array(z.string().uuid()).min(1, 'Debe asignar al menos un perfil'),
})

export type UserInput = z.infer<typeof UserSchema>

export const UserUpdateSchema = UserSchema.partial().extend({
  id: z.string().uuid(),
})

export type UserUpdateInput = z.infer<typeof UserUpdateSchema>
