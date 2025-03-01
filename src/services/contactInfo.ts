import { Database } from '@/types/supabase';
import { useIssueStore } from '@/store/issueStore';

// Define the Issue type from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];

// Define the structure for contact information
export interface GovernmentContact {
  name: string;
  email: string;
  phone: string;
  website: string;
  department?: string;
  position?: string;
  address?: string;
  notes?: string;
  limitations?: string;
  [key: string]: string | undefined;
}

// Function to query Perplexity API - used server-side only
export async function queryPerplexityForContactInfo(issue: Issue): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Perplexity API key is not configured');
  }

  // Construct a detailed prompt based on the issue
  const prompt = `I need to find government contact information for reporting the following community issue:
  
Issue Title: ${issue.title}
Issue Description: ${issue.description}
Location: ${issue.address}
Category: ${issue.category}

Please provide the most relevant government department, official, or agency that would handle this type of issue in this location. Include their name, email address, phone number, and website if available. 

Be specific to the location mentioned and try to find direct contact information rather than general websites or phone numbers. If possible, provide:
1. The specific department page URL rather than just the main government website
2. Direct phone numbers for the relevant department rather than general helplines
3. Email addresses for the specific department or officials responsible
4. Any online reporting systems or forms specifically for this type of issue

If you can't find specific information for some aspects, please note that limitation.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that provides accurate government contact information for community issues. Your goal is to find the most specific and direct contact information possible. Dig deep into government websites to find department-specific pages, direct phone numbers, and email addresses rather than just general contact information. If you can only find general information, acknowledge this limitation.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Perplexity API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error querying Perplexity API:', error);
    throw error;
  }
}

// Function to parse Perplexity response using OpenAI - used server-side only
export async function parseContactInfoWithOpenAI(perplexityResponse: string): Promise<GovernmentContact> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `
Parse the following text into a structured JSON format with these fields:
- name (department or person name, this is REQUIRED - use the most relevant department name if not explicitly stated)
- email (if available)
- phone (if available)
- website (if available)
- department (if different from name)
- position (if applicable)
- address (if available)
- notes (include any additional relevant information, service details, or instructions)
- limitations (identify any shortcomings in the information provided, such as missing specific contact details, generic websites, or information that needs verification)

IMPORTANT: 
1. If the text mentions multiple departments or services, choose the most relevant one as the primary contact.
2. If specific contact details are mentioned for a service like 3-1-1, include those details.
3. If the text has sections with "###" headers, extract information from all relevant sections.
4. If a field is not available, use null or an empty string.
5. The 'name' field MUST contain a meaningful value - never return "Unknown" if any department or service is mentioned.
6. For the 'limitations' field, critically analyze what information might be missing or too generic. For example, if only a general website is provided instead of a specific department page, note this limitation.

Text to parse:
${perplexityResponse}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant that parses unstructured text into structured JSON data. Your task is to extract government contact information from text and format it as JSON. Be thorough and extract all relevant details, even if they are presented in an unusual format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const parsedContent = JSON.parse(data.choices[0].message.content);
    
    // Ensure all required fields are present with better fallbacks
    return {
      name: parsedContent.name || 'Government Department',
      email: parsedContent.email || '',
      phone: parsedContent.phone || '',
      website: parsedContent.website || '',
      department: parsedContent.department || undefined,
      position: parsedContent.position || undefined,
      address: parsedContent.address || undefined,
      notes: parsedContent.notes || undefined,
      limitations: parsedContent.limitations || undefined
    };
  } catch (error) {
    console.error('Error parsing with OpenAI:', error);
    throw error;
  }
}

// Function to extract contact information from the AI response
export function extractContactInfo(response: string): GovernmentContact {
  // Parse the response to extract contact information
  // This is a simple implementation - in a real app, you might want more robust parsing
  try {
    // Default values
    const contact: GovernmentContact = {
      name: 'Government Department',
      email: '',
      phone: '',
      website: ''
    };
    
    // Extract name (look for patterns like "Name:" or "Department:")
    const nameMatch = response.match(/(?:Name|Department|Agency|Contact):\s*([^\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      contact.name = nameMatch[1].trim();
    }
    
    // Extract email (look for email patterns)
    const emailMatch = response.match(/(?:Email|E-mail):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) || 
                      response.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && emailMatch[1]) {
      contact.email = emailMatch[1].trim();
    }
    
    // Extract phone (look for phone patterns)
    const phoneMatch = response.match(/(?:Phone|Tel|Telephone):\s*([0-9\-\(\)\s\+\.]+)/i) ||
                      response.match(/(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4})/);
    if (phoneMatch && phoneMatch[1]) {
      contact.phone = phoneMatch[1].trim();
    }
    
    // Extract website (look for URL patterns)
    const websiteMatch = response.match(/(?:Website|Web|URL):\s*(https?:\/\/[^\s]+)/i) ||
                        response.match(/(https?:\/\/[^\s]+)/);
    if (websiteMatch && websiteMatch[1]) {
      contact.website = websiteMatch[1].trim();
    }
    
    // Extract department if different from name
    const departmentMatch = response.match(/(?:Department):\s*([^\n]+)/i);
    if (departmentMatch && departmentMatch[1] && departmentMatch[1].trim() !== contact.name) {
      contact.department = departmentMatch[1].trim();
    }
    
    // Extract position
    const positionMatch = response.match(/(?:Position|Title|Role):\s*([^\n]+)/i);
    if (positionMatch && positionMatch[1]) {
      contact.position = positionMatch[1].trim();
    }
    
    // Extract address
    const addressMatch = response.match(/(?:Address|Location):\s*([^\n]+(?:\n[^\n]+)*)/i);
    if (addressMatch && addressMatch[1]) {
      contact.address = addressMatch[1].trim();
    }
    
    // Extract notes (any additional information)
    const notesMatch = response.match(/(?:Notes|Additional Information):\s*([^\n]+(?:\n[^\n]+)*)/i);
    if (notesMatch && notesMatch[1]) {
      contact.notes = notesMatch[1].trim();
    }
    
    // Extract limitations
    const limitationsMatch = response.match(/(?:Limitations|Constraints):\s*([^\n]+(?:\n[^\n]+)*)/i);
    if (limitationsMatch && limitationsMatch[1]) {
      contact.limitations = limitationsMatch[1].trim();
    }
    
    return contact;
  } catch (error) {
    console.error('Error extracting contact info:', error);
    // Return a fallback contact
    return {
      name: 'Government Department',
      email: '',
      phone: '',
      website: '',
      notes: 'There was an error extracting the contact information.'
    };
  }
}

// Main function to get government contact information
export async function getGovernmentContactInfo(issue: Issue): Promise<{ contact: GovernmentContact; rawResponse: string }> {
  try {
    // Check if we already have contact info in the database
    if (issue.contact_info) {
      const storedInfo = issue.contact_info as GovernmentContact & { rawResponse?: string };
      if (storedInfo.name && typeof storedInfo.name === 'string') {
        return {
          contact: {
            name: storedInfo.name,
            email: storedInfo.email || '',
            phone: storedInfo.phone || '',
            website: storedInfo.website || '',
            department: storedInfo.department,
            position: storedInfo.position,
            address: storedInfo.address,
            notes: storedInfo.notes,
            limitations: storedInfo.limitations
          },
          rawResponse: storedInfo.rawResponse || ''
        };
      }
    }

    // Check if we're running on the client side
    if (typeof window !== 'undefined') {
      console.log('Running on client side, making API call to /api/contact-info');
      // Client-side: use the API route
      const response = await fetch('/api/contact-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ issue }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response not OK:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch contact information');
      }
      
      const result = await response.json();
      console.log('API response result:', result);
      
      // Save the contact info to the database
      try {
        console.log('Attempting to save contact info to database via store');
        const issueStore = useIssueStore.getState();
        const updatedIssue = await issueStore.updateIssueContactInfo(issue.id, {
          ...result.contact,
          rawResponse: result.rawResponse
        });
        console.log('Result from updateIssueContactInfo:', updatedIssue);
      } catch (saveError) {
        console.error('Error saving contact info to database:', saveError);
        // Continue even if saving fails
      }
      
      return result;
    } else {
      // Server-side: use the direct implementation
      // Step 1: Query Perplexity for information
      const perplexityResponse = await queryPerplexityForContactInfo(issue);
      
      // Step 2: Parse the response with OpenAI
      const parsedContact = await parseContactInfoWithOpenAI(perplexityResponse);
      
      const result = {
        contact: parsedContact,
        rawResponse: perplexityResponse
      };
      
      return result;
    }
  } catch (error: unknown) {
    console.error('Error getting government contact info:', error);
    // Return a fallback contact
    return {
      contact: {
        name: 'Error retrieving contact',
        email: '',
        phone: '',
        website: '',
        notes: 'There was an error retrieving the contact information. Please try again later.',
        limitations: 'There was an error retrieving the contact information. Please try again later.'
      },
      rawResponse: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 