import { NextRequest, NextResponse } from 'next/server';
import { getGovernmentContactInfo } from '@/services/contactInfo';
import { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase-server';

type Issue = Database['public']['Tables']['issues']['Row'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issue } = body;
    
    if (!issue) {
      return NextResponse.json(
        { error: 'Issue data is required' },
        { status: 400 }
      );
    }
    
    const result = await getGovernmentContactInfo(issue as Issue);
    
    // Save the contact info to the database
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('issues')
        .update({ 
          contact_info: {
            ...result.contact,
            rawResponse: result.rawResponse
          } 
        })
        .eq('id', issue.id)
        .select();
      
      if (error) {
        console.error('Error saving contact info to database:', error);
      }
    } catch (saveError) {
      console.error('Error saving contact info to database:', saveError);
      // Continue even if saving fails
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in contact-info API route:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        contact: {
          name: 'Error retrieving contact',
          email: '',
          phone: '',
          website: '',
          notes: 'There was an error retrieving the contact information. Please try again later.',
          limitations: 'There was an error retrieving the contact information. Please try again later.'
        },
        rawResponse: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 