import { create } from 'zustand';
import { Database } from '@/types/supabase';
import * as supabaseService from '@/services/supabase';

// Define types directly from the Supabase generated types
type Issue = Database['public']['Tables']['issues']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'] & {
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  }
};
type IssueInsert = Database['public']['Tables']['issues']['Insert'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];

interface IssueState {
  issues: Issue[];
  currentIssue: Issue | null;
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchIssues: () => Promise<void>;
  fetchIssueById: (id: string) => Promise<void>;
  fetchCommentsByIssueId: (issueId: string) => Promise<void>;
  createIssue: (issue: IssueInsert) => Promise<Issue | null>;
  createComment: (comment: Omit<CommentInsert, 'upvotes'>) => Promise<void>;
  updateIssueUpvotes: (id: string, upvotes: number) => Promise<void>;
  toggleIssueUpvote: (issueId: string, userId: string) => Promise<{ issue: Issue | null; isUpvoted: boolean; currentUpvotes: number }>;
  checkIssueUpvote: (issueId: string, userId: string) => Promise<boolean>;
  toggleCommentUpvote: (commentId: string, userId: string) => Promise<{ comment: Comment | null; isUpvoted: boolean; currentUpvotes: number }>;
  checkCommentUpvote: (commentId: string, userId: string) => Promise<boolean>;
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  currentIssue: null,
  comments: [],
  isLoading: false,
  error: null,
  
  fetchIssues: async () => {
    set({ isLoading: true, error: null });
    try {
      const issues = await supabaseService.getIssues();
      set({ issues, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch issues', isLoading: false });
      console.error('Error fetching issues:', error);
    }
  },
  
  fetchIssueById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const issue = await supabaseService.getIssueById(id);
      set({ currentIssue: issue, isLoading: false });
    } catch (error) {
      set({ error: `Failed to fetch issue with id ${id}`, isLoading: false });
      console.error(`Error fetching issue with id ${id}:`, error);
    }
  },
  
  fetchCommentsByIssueId: async (issueId: string) => {
    set({ isLoading: true, error: null });
    try {
      const comments = await supabaseService.getCommentsByIssueId(issueId);
      set({ comments, isLoading: false });
    } catch (error) {
      set({ error: `Failed to fetch comments for issue ${issueId}`, isLoading: false });
      console.error(`Error fetching comments for issue ${issueId}:`, error);
    }
  },
  
  createIssue: async (issue) => {
    set({ isLoading: true, error: null });
    try {
      const newIssue = await supabaseService.createIssue(issue);
      if (newIssue) {
        set((state) => ({ 
          issues: [newIssue, ...state.issues],
          isLoading: false 
        }));
      }
      return newIssue;
    } catch (error) {
      set({ error: 'Failed to create issue', isLoading: false });
      console.error('Error creating issue:', error);
      return null;
    }
  },
  
  createComment: async (comment) => {
    set({ isLoading: true, error: null });
    try {
      const newComment = await supabaseService.createComment(comment);
      if (newComment) {
        set((state) => ({ 
          comments: [...state.comments, newComment],
          isLoading: false 
        }));
      }
    } catch (error) {
      set({ error: 'Failed to create comment', isLoading: false });
      console.error('Error creating comment:', error);
    }
  },
  
  updateIssueUpvotes: async (id: string, upvotes: number) => {
    // This function is now obsolete with real-time subscriptions
    // Keeping it for backward compatibility but making it a no-op
    return;
  },
  
  toggleIssueUpvote: async (issueId: string, userId: string) => {
    try {
      const result = await supabaseService.toggleIssueUpvote(issueId, userId);
      
      // Ensure we have a valid response
      if (result && typeof result.currentUpvotes === 'number') {
        // Ensure upvote count is never negative
        const safeUpvoteCount = Math.max(0, result.currentUpvotes);
        
        return { 
          issue: null, 
          isUpvoted: result.isUpvoted, 
          currentUpvotes: safeUpvoteCount 
        };
      } else {
        console.error("Invalid response from supabaseService.toggleIssueUpvote:", result);
        return { issue: null, isUpvoted: false, currentUpvotes: 0 };
      }
    } catch (error) {
      console.error(`Error toggling upvote for issue ${issueId}:`, error);
      return { issue: null, isUpvoted: false, currentUpvotes: 0 };
    }
  },
  
  checkIssueUpvote: async (issueId: string, userId: string) => {
    try {
      return await supabaseService.checkIssueUpvote(issueId, userId);
    } catch (error) {
      console.error(`Error checking upvote status for issue ${issueId}:`, error);
      return false;
    }
  },
  
  toggleCommentUpvote: async (commentId: string, userId: string) => {
    try {
      const result = await supabaseService.toggleCommentUpvote(commentId, userId);
      
      // Ensure we have a valid response
      if (result && typeof result.currentUpvotes === 'number') {
        // Ensure upvote count is never negative
        const safeUpvoteCount = Math.max(0, result.currentUpvotes);
        
        return { 
          comment: null, 
          isUpvoted: result.isUpvoted, 
          currentUpvotes: safeUpvoteCount 
        };
      } else {
        console.error("Invalid response from supabaseService.toggleCommentUpvote:", result);
        return { comment: null, isUpvoted: false, currentUpvotes: 0 };
      }
    } catch (error) {
      console.error(`Error toggling upvote for comment ${commentId}:`, error);
      return { comment: null, isUpvoted: false, currentUpvotes: 0 };
    }
  },
  
  checkCommentUpvote: async (commentId: string, userId: string) => {
    try {
      return await supabaseService.checkCommentUpvote(commentId, userId);
    } catch (error) {
      console.error(`Error checking upvote status for comment ${commentId}:`, error);
      return false;
    }
  },
})); 