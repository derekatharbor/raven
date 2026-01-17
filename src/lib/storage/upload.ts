// Path: src/lib/storage/upload.ts

import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'documents'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export interface UploadResult {
  url: string
  path: string
}

export async function uploadImage(
  file: File,
  userId: string,
  documentId: string
): Promise<UploadResult> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image')
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be less than 5MB')
  }

  const supabase = createClient()
  
  // Generate unique filename
  const ext = file.name.split('.').pop() || 'png'
  const timestamp = Date.now()
  const path = `${userId}/${documentId}/${timestamp}.${ext}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

export async function deleteImage(path: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}
