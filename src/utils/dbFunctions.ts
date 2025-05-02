
import { supabase } from '@/integrations/supabase/client';

// Функция для увеличения числового столбца таблицы на 1
export const incrementCounter = async (
  tableName: string,
  columnName: string,
  rowId: string
): Promise<number> => {
  try {
    // Получаем текущее значение
    const { data: current, error: fetchError } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', rowId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentValue = current[columnName] || 0;
    const newValue = currentValue + 1;
    
    // Обновляем значение
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

// Функция для уменьшения числового столбца таблицы на 1
export const decrementCounter = async (
  tableName: string,
  columnName: string,
  rowId: string
): Promise<number> => {
  try {
    // Получаем текущее значение
    const { data: current, error: fetchError } = await supabase
      .from(tableName)
      .select(columnName)
      .eq('id', rowId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentValue = current[columnName] || 0;
    const newValue = Math.max(0, currentValue - 1); // Не позволяем опуститься ниже 0
    
    // Обновляем значение
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
