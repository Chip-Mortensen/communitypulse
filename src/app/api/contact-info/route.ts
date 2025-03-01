import { NextRequest, NextResponse } from 'next/server';
import { getGovernmentContactInfo } from '@/services/contactInfo';
import { Database } from '@/types/supabase';
import { createClient } from '@/lib/supabase-server';

type Issue = Database['public']['Tables']['issues']['Row'];

// Define a type for contact information that's compatible with Supabase's Json type
interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  department?: string;
  position?: string;
  address?: string;
  notes?: string;
  limitations?: string;
  rawResponse?: string;
  [key: string]: string | undefined;
}

export async function POST(request: NextRequest) {
  console.log('Contact info API route called');
  try {
    const body = await request.json();
    const { issue } = body;
    
    if (!issue) {
      console.error('No issue data provided in request');
      return NextResponse.json(
        { error: 'Issue data is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching contact info for issue:', issue.id);
    const result = await getGovernmentContactInfo(issue as Issue);
    console.log('Contact info result:', result);
    
    // Save the contact info to the database
    try {
      console.log('Saving contact info to database for issue:', issue.id);
      const supabase = await createClient();
      
      // First, get the current issue to ensure we have the latest data
      console.log('Fetching current issue data');
      const { data: currentIssue, error: fetchError } = await supabase
        .from('issues')
        .select('*')
        .eq('id', issue.id)
        .single();
        
      if (fetchError) {
        console.error(`Error fetching current issue ${issue.id}:`, fetchError);
        // Continue even if fetching fails
      } else {
        // Create a new issue object with all the existing data plus the updated contact_info
        const updatedIssue = {
          ...currentIssue,
          contact_info: {
            ...result.contact,
            rawResponse: result.rawResponse
          } as ContactInfo
        };
        
        console.log('Attempting to update issue with full object');
        
        // Update the entire issue object
        const { error } = await supabase
          .from('issues')
          .update(updatedIssue)
          .eq('id', issue.id)
          .select();
        
        if (error) {
          console.error(`Error updating issue ${issue.id}:`, error);
        } else {
          // Even if data is empty, the update might have succeeded
          console.log('Update operation completed successfully');
          
          // Verify the update by fetching the issue again
          const { data: verifyData, error: verifyError } = await supabase
            .from('issues')
            .select('*')
            .eq('id', issue.id)
            .single();
            
            if (verifyError) {
              console.error(`Error verifying update for issue ${issue.id}:`, verifyError);
            } else if (verifyData && verifyData.contact_info) {
              console.log('Verified update was successful:', verifyData.contact_info);
            } else {
              console.log('Could not verify if update was successful');
            }
        }
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