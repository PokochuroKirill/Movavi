
import { supabase } from '@/integrations/supabase/client';

// Function to upload a file to a specific bucket
export const uploadFile = async (
  bucket: string,
  file: File,
  path: string
): Promise<string | null> => {
  try {
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return data.publicUrl;
  } catch (error) {
    console.error(`Error uploading file to ${bucket}:`, error);
    return null;
  }
};

// Function to remove a file from a bucket
export const removeFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error removing file from ${bucket}:`, error);
    return false;
  }
};

// Function to get a list of files in a folder
export const listFiles = async (
  bucket: string,
  folderPath: string
): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath);
    
    if (error) throw error;
    
    return data.map(item => item.name);
  } catch (error) {
    console.error(`Error listing files in ${bucket}/${folderPath}:`, error);
    return [];
  }
};
