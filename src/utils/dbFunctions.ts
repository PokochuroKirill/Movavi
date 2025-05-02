
import { supabase } from '@/integrations/supabase/client';

// Функция для увеличения числового столбца таблицы на 1
export const incrementCounter = async (
  tableName: string,
  columnName: string,
  rowId: string
): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('increment', {
      table_name: tableName,
      column_name: columnName,
      row_id: rowId
    });

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase.rpc('decrement', {
      table_name: tableName,
      column_name: columnName,
      row_id: rowId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error decrementing counter:', error);
    throw error;
  }
};
