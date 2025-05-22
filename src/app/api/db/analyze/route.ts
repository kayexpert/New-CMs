import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * GET /api/db/analyze
 * Analyze the database structure and return detailed information
 */
export async function GET() {
  try {
    // Use a direct SQL query to get all tables and their row counts
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql_query: `
        WITH table_counts AS (
          SELECT
            table_name,
            (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND columns.table_name = tables.table_name) AS column_count,
            CASE
              WHEN EXISTS (
                SELECT 1 FROM pg_stat_user_tables WHERE schemaname = 'public' AND relname = table_name
              ) THEN (
                SELECT reltuples::bigint FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE n.nspname = 'public' AND c.relname = table_name
              )
              ELSE 0
            END AS estimated_row_count
          FROM information_schema.tables
          WHERE table_schema = 'public'
        ),
        column_details AS (
          SELECT
            table_name,
            json_agg(
              json_build_object(
                'column_name', column_name,
                'data_type', data_type,
                'is_nullable', is_nullable,
                'column_default', column_default
              )
            ) AS columns
          FROM information_schema.columns
          WHERE table_schema = 'public'
          GROUP BY table_name
        )
        SELECT
          tc.table_name,
          tc.column_count,
          tc.estimated_row_count,
          cd.columns
        FROM table_counts tc
        LEFT JOIN column_details cd ON tc.table_name = cd.table_name
        ORDER BY tc.estimated_row_count DESC, tc.table_name;
      `
    });

    if (error) {
      console.error('Error executing SQL:', error);
      return NextResponse.json(
        { error: 'Failed to analyze database', details: error.message },
        { status: 500 }
      );
    }

    // Transform the data into the expected format
    const tableDetails = data.map(table => ({
      name: table.table_name,
      columns: table.columns || [],
      rowCount: parseInt(table.estimated_row_count) || 0,
      columnCount: parseInt(table.column_count) || 0
    }));

    // Return the analysis results
    return NextResponse.json({
      tables: tableDetails
    });
  } catch (error) {
    console.error('Error analyzing database:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze database',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
