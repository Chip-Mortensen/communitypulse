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

  // Add empty profiles object to match the extended Comment type
  return {
    ...data[0],
    profiles: {
      display_name: null,
      avatar_url: null
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

  // Add empty profiles object to match the extended Comment type
  return {
    ...data[0],
    profiles: {
      display_name: null,
      avatar_url: null
    }
  };
} 