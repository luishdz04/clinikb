import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    if (!supabase) {
      console.error('Failed to create Supabase admin client');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('gym_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching gym settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gym settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
