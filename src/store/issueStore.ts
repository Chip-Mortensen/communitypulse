import { create } from 'zustand';
import { Issue, Comment } from '@/types/database.types';
import * as supabaseService from '@/services/supabase';

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
  createIssue: (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'upvotes'>) => Promise<Issue | null>;
  createComment: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'upvotes'>) => Promise<void>;
  updateIssueUpvotes: (id: string, upvotes: number) => Promise<void>;
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
    try {
      const updatedIssue = await supabaseService.updateIssueUpvotes(id, upvotes);
      if (updatedIssue) {
        set((state) => ({
          issues: state.issues.map((issue) => 
            issue.id === id ? { ...issue, upvotes } : issue
          ),
          currentIssue: state.currentIssue?.id === id 
            ? { ...state.currentIssue, upvotes } 
            : state.currentIssue
        }));
      }
    } catch (error) {
      console.error(`Error updating upvotes for issue ${id}:`, error);
    }
  },
})); 