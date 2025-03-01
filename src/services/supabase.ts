import { createClient } from '@/lib/supabase';
import { Database } from '@/types/supabase';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];

// Issues
export async function getIssues() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching issues:', error);
    return [];
  }

  return data as Issue[];
}

export async function getIssueById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching issue with id ${id}:`, error);
    return null;
  }

  return data as Issue;
}

export async function createIssue(issue: IssueInsert) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .insert([
      {
        ...issue,
        upvotes: 0,
        contact_info: null,
      },
    ])
    .select();

  if (error) {
    console.error('Error creating issue:', error);
    return null;
  }

  return data[0] as Issue;
}

export async function updateIssueUpvotes(id: string, upvotes: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .update({ upvotes })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating upvotes for issue ${id}:`, error);
    return null;
  }

  return data[0] as Issue;
}

/**
 * Toggle an upvote for an issue. If the user has already upvoted the issue,
 * the upvote will be removed. Otherwise, a new upvote will be created.
 * 
 * @param issueId The ID of the issue to toggle the upvote for
 * @param userId The ID of the user toggling the upvote
 * @returns An object with the updated issue and a boolean indicating if the issue is now upvoted
 */
export async function toggleIssueUpvote(issueId: string, userId: string) {
  const supabase = createClient();
  
  try {
    // Use a transaction to ensure atomicity
    const { data, error } = await supabase.rpc('toggle_issue_upvote', {
      p_issue_id: issueId,
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error from toggle_issue_upvote RPC:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from toggle_issue_upvote');
      return { issue: null, isUpvoted: false, currentUpvotes: 0 };
    }
    
    // Ensure we have valid data
    const isUpvoted = !!data[0]?.is_upvoted;
    const currentUpvotes = typeof data[0]?.current_upvotes === 'number' ? data[0].current_upvotes : 0;
    
    return { 
      issue: null, 
      isUpvoted, 
      currentUpvotes 
    };
  } catch (error) {
    console.error(`Error toggling upvote for issue ${issueId}:`, error);
    return { issue: null, isUpvoted: false, currentUpvotes: 0 };
  }
}

/**
 * Check if a user has already upvoted an issue
 * 
 * @param issueId The ID of the issue to check
 * @param userId The ID of the user to check
 * @returns A boolean indicating if the user has upvoted the issue
 */
export async function checkIssueUpvote(issueId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('upvotes')
    .select('id')
    .eq('issue_id', issueId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error(`Error checking upvote status for issue ${issueId}:`, error);
    return false;
  }
  
  return !!data;
}

// Comments
export async function getCommentsByIssueId(issueId: string) {
  const supabase = createClient();
  
  // First, get the comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (commentsError) {
    console.error(`Error fetching comments for issue ${issueId}:`, commentsError);
    return [];
  }

  // If we have comments, fetch the profile information for each comment
  if (comments && comments.length > 0) {
    // Get unique user IDs
    const userIds = [...new Set(comments.map(comment => comment.user_id))];
    
    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
    } else if (profiles) {
      // Create a map of user_id to profile info
      const profileMap = profiles.reduce((map, profile) => {
        map[profile.id] = {
          display_name: profile.display_name,
          avatar_url: profile.avatar_url
        };
        return map;
      }, {} as Record<string, { display_name: string | null, avatar_url: string | null }>);
      
      // Attach profile info to comments
      return comments.map(comment => ({
        ...comment,
        profiles: {
          display_name: profileMap[comment.user_id]?.display_name || null,
          avatar_url: profileMap[comment.user_id]?.avatar_url || null
        }
      }));
    }
  }
  
  // Return comments without profiles if we couldn't fetch profiles
  return comments.map(comment => ({
    ...comment,
    profiles: {
      display_name: null,
      avatar_url: null
    }
  }));
}

export async function createComment(comment: Omit<CommentInsert, 'upvotes'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        ...comment,
        upvotes: 0,
      },
    ])
    .select();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  // Fetch the user's profile information
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', comment.user_id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    // Return comment with empty profile if we couldn't fetch the profile
    return {
      ...data[0],
      profiles: {
        display_name: null,
        avatar_url: null
      }
    };
  }

  // Return comment with profile information
  return {
    ...data[0],
    profiles: {
      display_name: profileData.display_name,
      avatar_url: profileData.avatar_url
    }
  };
}

export async function updateCommentUpvotes(id: string, upvotes: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .update({ upvotes })
    .eq('id', id)
    .select();

  if (error) {
    console.error(`Error updating upvotes for comment ${id}:`, error);
    return null;
  }

  // Fetch the user's profile information
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', data[0].user_id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    // Return comment with empty profile if we couldn't fetch the profile
    return {
      ...data[0],
      profiles: {
        display_name: null,
        avatar_url: null
      }
    };
  }

  // Return comment with profile information
  return {
    ...data[0],
    profiles: {
      display_name: profileData.display_name,
      avatar_url: profileData.avatar_url
    }
  };
}

/**
 * Toggle an upvote for a comment. If the user has already upvoted the comment,
 * the upvote will be removed. Otherwise, a new upvote will be created.
 * 
 * @param commentId The ID of the comment to toggle the upvote for
 * @param userId The ID of the user toggling the upvote
 * @returns An object with the updated comment and a boolean indicating if the comment is now upvoted
 */
export async function toggleCommentUpvote(commentId: string, userId: string) {
  const supabase = createClient();
  
  try {
    // Use a transaction to ensure atomicity
    const { data, error } = await supabase.rpc('toggle_comment_upvote', {
      p_comment_id: commentId,
      p_user_id: userId
    });
    
    if (error) {
      console.error('Error from toggle_comment_upvote RPC:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned from toggle_comment_upvote');
      return { comment: null, isUpvoted: false, currentUpvotes: 0 };
    }
    
    // Ensure we have valid data
    const isUpvoted = !!data[0]?.is_upvoted;
    const currentUpvotes = typeof data[0]?.current_upvotes === 'number' ? data[0].current_upvotes : 0;
    
    return { 
      comment: null, 
      isUpvoted, 
      currentUpvotes 
    };
  } catch (error) {
    console.error(`Error toggling upvote for comment ${commentId}:`, error);
    return { comment: null, isUpvoted: false, currentUpvotes: 0 };
  }
}

/**
 * Check if a user has already upvoted a comment
 * 
 * @param commentId The ID of the comment to check
 * @param userId The ID of the user to check
 * @returns A boolean indicating if the user has upvoted the comment
 */
export async function checkCommentUpvote(commentId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('upvotes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error(`Error checking upvote status for comment ${commentId}:`, error);
    return false;
  }
  
  return !!data;
}

/**
 * Delete an issue by ID
 * 
 * @param id The ID of the issue to delete
 * @returns A boolean indicating if the deletion was successful
 */
export async function deleteIssue(id: string): Promise<boolean> {
  const supabase = createClient();
  
  try {
    // First delete all comments associated with this issue
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('issue_id', id);
    
    if (commentsError) {
      console.error(`Error deleting comments for issue ${id}:`, commentsError);
      return false;
    }
    
    // Then delete all upvotes associated with this issue
    const { error: upvotesError } = await supabase
      .from('upvotes')
      .delete()
      .eq('issue_id', id);
    
    if (upvotesError) {
      console.error(`Error deleting upvotes for issue ${id}:`, upvotesError);
      return false;
    }
    
    // Finally delete the issue itself
    const { error } = await supabase
      .from('issues')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting issue ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting issue ${id}:`, error);
    return false;
  }
}

/**
 * Update the contact information for an issue
 * 
 * @param issueId The ID of the issue to update
 * @param contactInfo The contact information to store
 * @returns The updated issue or null if an error occurred
 */
export async function updateIssueContactInfo(issueId: string, contactInfo: any) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('issues')
    .update({ contact_info: contactInfo })
    .eq('id', issueId)
    .select();

  if (error) {
    console.error(`Error updating contact info for issue ${issueId}:`, error);
    return null;
  }

  return data[0] as Issue;
} 