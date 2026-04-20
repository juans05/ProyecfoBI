
"use server"

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function updateCompanyBranding(companyId: string, formData: FormData) {
  const updateData: any = {}
  
  const tradeName = formData.get('tradeName') as string
  if (tradeName) {
    updateData.tradeName = tradeName
  }

  const file = formData.get('file') as File | null
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Cloudinary usando un stream
    const uploadResult: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'intranet_bi/logos',
          public_id: `logo-${companyId}`,
          overwrite: true,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    updateData.logoUrl = uploadResult.secure_url
  }

  // Branding Colors
  const primaryColor = formData.get('primaryColor') as string
  const secondaryColor = formData.get('secondaryColor') as string
  const sidebarBgColor = formData.get('sidebarBgColor') as string
  const sidebarTextColor = formData.get('sidebarTextColor') as string

  if (primaryColor) updateData.primaryColor = primaryColor
  if (secondaryColor) updateData.secondaryColor = secondaryColor
  if (sidebarBgColor) updateData.sidebarBgColor = sidebarBgColor
  if (sidebarTextColor) updateData.sidebarTextColor = sidebarTextColor

  await prisma.company.update({
    where: { id: companyId },
    data: updateData
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin/settings')
  return { success: true }
}
