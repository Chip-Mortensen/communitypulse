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
  deleteIssue: (id: string) => Promise<boolean>;
  updateIssueContactInfo: (issueId: string, contactInfo: any) => Promise<Issue | null>;
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
        
        // Automatically fetch contact information for the new issue
        // This is done asynchronously so we don't block the UI
        try {
          // We don't await this call to avoid blocking the UI
          fetch('/api/contact-info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ issue: newIssue }),
          }).then(async (response) => {
            if (response.ok) {
              const result = await response.json();
              // Update the issue with the contact info
              get().updateIssueContactInfo(newIssue.id, {
                ...result.contact,
                rawResponse: result.rawResponse
              });
            }
          }).catch(error => {
            console.error('Error auto-fetching contact info:', error);
          });
        } catch (contactError) {
          console.error('Error initiating contact info fetch:', contactError);
          // Continue even if contact info fetch fails
        }
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
  
  deleteIssue: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await supabaseService.deleteIssue(id);
      if (success) {
        set((state) => ({ 
          issues: state.issues.filter(issue => issue.id !== id),
          isLoading: false 
        }));
      } else {
        set({ error: `Failed to delete issue with id ${id}`, isLoading: false });
      }
      return success;
    } catch (error) {
      set({ error: `Failed to delete issue with id ${id}`, isLoading: false });
      console.error(`Error deleting issue with id ${id}:`, error);
      return false;
    }
  },
  
  updateIssueContactInfo: async (issueId: string, contactInfo: any) => {
    try {
      const updatedIssue = await supabaseService.updateIssueContactInfo(issueId, contactInfo);
      
      if (updatedIssue) {
        // Update the current issue if it's the one being modified
        if (get().currentIssue?.id === issueId) {
          set({ currentIssue: updatedIssue });
        }
        
        // Update the issue in the issues array
        set((state) => ({
          issues: state.issues.map(issue => 
            issue.id === issueId ? updatedIssue : issue
          )
        }));
      }
      
      return updatedIssue;
    } catch (error) {
      console.error(`Error updating contact info for issue ${issueId}:`, error);
      return null;
    }
  },
}));