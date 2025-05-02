
import { supabase } from '@/integrations/supabase/client';

// Function to increment a numeric column in a table by 1
export const incrementCounter = async (
  tableName: string,
  columnName: string,
  rowId: string
): Promise<number> => {
  try {
    // Get current value
    const { data: current, error: fetchError } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', rowId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentValue = current[columnName] || 0;
    const newValue = currentValue + 1;
    
    // Update the value
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ [columnName]: newValue })
      .eq('id', rowId);
      
    if (updateError) throw updateError;
    
    return newValue;
  } catch (error) {
    console.error('Error incrementing counter:', error);
    throw error;
  }
};

// Function to decrement a numeric column in a table by 1
export const decrementCounter = async (
  tableName: string,
  columnName: string,
  rowId: string
): Promise<number> => {
  try {
    // Get current value
    const { data: current, error: fetchError } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', rowId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentValue = current[columnName] || 0;
    const newValue = Math.max(0, currentValue - 1); // Don't go below 0
    
    // Update the value
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ [columnName]: newValue })
      .eq('id', rowId);
      
    if (updateError) throw updateError;
    
    return newValue;
  } catch (error) {
    console.error('Error decrementing counter:', error);
    throw error;
  }
};
