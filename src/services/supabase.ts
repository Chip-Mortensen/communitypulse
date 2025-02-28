import { createClient } from '@/lib/supabase';
import { Issue, Comment } from '@/types/database.types';

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

export async function createIssue(issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'upvotes'>) {
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
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching comments for issue ${issueId}:`, error);
    return [];
  }

  return data as Comment[];
}

export async function createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'upvotes'>) {
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

  return data[0] as Comment;
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

  return data[0] as Comment;
} 