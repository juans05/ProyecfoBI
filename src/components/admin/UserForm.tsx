"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserSchema, type UserInput } from "@/domains/users/users.schema"
import { createUser, updateUser } from "@/domains/users/users.service"
import { Loader2, Save, X, Shield, Mail, User as UserIcon, Lock } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface UserFormProps {
  initialData?: any
  profiles: any[]
}

export function UserForm({ initialData, profiles }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<UserInput>({
    resolver: zodResolver(UserSchema),
    defaultValues: initialData ? {
      ...initialData,
      profileIds: initialData.profiles?.map((p: any) => p.profileId) || []
    } : {
      isActive: true,
      profileIds: []
    }
  })

  const selectedProfiles = watch("profileIds") || []

  const toggleProfile = (id: string) => {
    const current = [...selectedProfiles]
    const index = current.indexOf(id)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(id)
    }
    setValue("profileIds", current, { shouldValidate: true })
  }

  async function onSubmit(data: UserInput) {
    setIsLoading(true)
    try {
      if (initialData) {
        await updateUser({ ...data, id: initialData.id } as any)
        toast.success("Usuario actualizado correctamente")
      } else {
        await createUser(data)
        toast.success("Usuario creado correctamente")
      }
      router.push("/dashboard/admin/users")
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: General Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 bg-white space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-4">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Nombre</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input {...register("firstName")} className="input pl-10" placeholder="Ej. Juan" />
                </div>
                {errors.firstName && <p className="error-msg">{errors.firstName.message}</p>}
              </div>
              
              <div>
                <label className="label">Apellido</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input {...register("lastName")} className="input pl-10" placeholder="Ej. Pérez" />
                </div>
                {errors.lastName && <p className="error-msg">{errors.lastName.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="label">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input {...register("email")} type="email" className="input pl-10" placeholder="juan.perez@empresa.com" />
                </div>
                {errors.email && <p className="error-msg">{errors.email.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="label">Contraseña {initialData && "(dejar en blanco para no cambiar)"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input {...register("password")} type="password" className="input pl-10" placeholder="••••••••" />
                </div>
                {errors.password && <p className="error-msg">{errors.password.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Profiles & Status */}
        <div className="space-y-6">
          <div className="card p-6 bg-white">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-4 mb-4">Perfiles y Acceso</h3>
            
            <div className="space-y-4">
              <label className="label flex items-center gap-2">
                <Shield size={16} />
                Asignar Perfiles
              </label>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => toggleProfile(profile.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg border text-sm transition-all",
                      selectedProfiles.includes(profile.id)
                        ? "bg-brand-50 border-brand-200 text-brand-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    )}
                  >
                    <span>{profile.name}</span>
                    {selectedProfiles.includes(profile.id) && <Save size={14} />}
                  </button>
                ))}
              </div>
              {errors.profileIds && <p className="error-msg">{errors.profileIds.message}</p>}

              <div className="pt-4 border-t mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input {...register("isActive")} type="checkbox" className="w-4 h-4 text-brand-600 rounded" />
                  <span className="text-sm font-medium text-slate-700">Usuario Activo</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 h-12">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} className="mr-2" />}
              {initialData ? "Guardar Cambios" : "Crear Usuario"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary w-full py-3 h-12">
              <X size={18} className="mr-2" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
