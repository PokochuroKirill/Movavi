
import { supabase } from "@/integrations/supabase/client";

// This utility can be used to generate TypeScript types from Supabase tables
// For development purposes only - DISABLED DUE TO TYPE ERRORS

export const generateTypesFromTables = async () => {
  console.warn('generateTypesFromTables is disabled due to type incompatibility.');
  return null;
  
  // Оригинальный код закомментирован, чтобы предотвратить ошибки TypeScript
  /*
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) throw tablesError;

    // Generate types for each table
    let typesCode = '// Auto-generated database types\n\n';

    for (const table of tables || []) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', table.tablename)
        .eq('table_schema', 'public');

      if (columnsError) throw columnsError;

      // Generate TypeScript interface
      typesCode += `export interface ${capitalize(table.tablename)} {\n`;

      for (const column of columns || []) {
        const tsType = mapPgTypeToTs(column.data_type);
        const nullable = column.is_nullable === 'YES' ? ' | null' : '';
        typesCode += `  ${column.column_name}: ${tsType}${nullable};\n`;
      }

      typesCode += '}\n\n';
    }

    console.log(typesCode);
    return typesCode;
  } catch (error) {
    console.error('Error generating types:', error);
    return null;
  }
  */
};

// Helper functions
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const mapPgTypeToTs = (pgType: string): string => {
  const typeMap: Record<string, string> = {
    'integer': 'number',
    'bigint': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'smallint': 'number',
    'text': 'string',
    'character varying': 'string',
    'character': 'string',
    'uuid': 'string',
    'boolean': 'boolean',
    'json': 'any',
    'jsonb': 'any',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'date': 'string',
    'ARRAY': 'any[]',
  };

  return typeMap[pgType] || 'any';
};
