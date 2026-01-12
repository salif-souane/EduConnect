export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: UserRole;
          address: string | null;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role: UserRole;
          address?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role?: UserRole;
          address?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          date_of_birth: string;
          class_id: string | null;
          student_number: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          date_of_birth: string;
          class_id?: string | null;
          student_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date_of_birth?: string;
          class_id?: string | null;
          student_number?: string | null;
          created_at?: string;
        };
      };
      teachers: {
        Row: {
          id: string;
          specialization: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          specialization?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          specialization?: string | null;
          created_at?: string;
        };
      };
      parents: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
        };
      };
      parent_student: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          relationship: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          relationship: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          relationship?: string;
          created_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          level: string;
          academic_year: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: string;
          academic_year: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          level?: string;
          academic_year?: string;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      teacher_subjects: {
        Row: {
          id: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          teacher_id: string;
          subject_id: string;
          class_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          teacher_id?: string;
          subject_id?: string;
          class_id?: string;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          room?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          room?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content: string | null;
          file_url: string | null;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          content?: string | null;
          file_url?: string | null;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          content?: string | null;
          file_url?: string | null;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          published_at?: string;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructions: string | null;
          due_date: string;
          max_grade: number;
          file_url: string | null;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          instructions?: string | null;
          due_date: string;
          max_grade?: number;
          file_url?: string | null;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          instructions?: string | null;
          due_date?: string;
          max_grade?: number;
          file_url?: string | null;
          class_id?: string;
          subject_id?: string;
          teacher_id?: string;
          created_at?: string;
        };
      };
      grades: {
        Row: {
          id: string;
          student_id: string;
          assignment_id: string;
          grade: number;
          comment: string | null;
          graded_by: string;
          graded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          assignment_id: string;
          grade: number;
          comment?: string | null;
          graded_by: string;
          graded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          assignment_id?: string;
          grade?: number;
          comment?: string | null;
          graded_by?: string;
          graded_at?: string;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          target_role: string | null;
          target_class_id: string | null;
          published_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          target_role?: string | null;
          target_class_id?: string | null;
          published_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          target_role?: string | null;
          target_class_id?: string | null;
          published_at?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          content: string;
          read: boolean;
          read_at: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          content: string;
          read?: boolean;
          read_at?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          subject?: string;
          content?: string;
          read?: boolean;
          read_at?: string | null;
          sent_at?: string;
          created_at?: string;
        };
      };
      forums: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          class_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          class_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          class_id?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          forum_id: string;
          author_id: string;
          title: string | null;
          content: string;
          parent_post_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          forum_id: string;
          author_id: string;
          title?: string | null;
          content: string;
          parent_post_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          forum_id?: string;
          author_id?: string;
          title?: string | null;
          content?: string;
          parent_post_id?: string | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_type: string;
          start_date: string;
          end_date: string | null;
          location: string | null;
          created_by: string;
          target_class_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_type: string;
          start_date: string;
          end_date?: string | null;
          location?: string | null;
          created_by: string;
          target_class_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_type?: string;
          start_date?: string;
          end_date?: string | null;
          location?: string | null;
          created_by?: string;
          target_class_id?: string | null;
          created_at?: string;
        };
      };
      polls: {
        Row: {
          id: string;
          title: string;
          question: string;
          options: Json;
          created_by: string;
          target_class_id: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          question: string;
          options: Json;
          created_by: string;
          target_class_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          question?: string;
          options?: Json;
          created_by?: string;
          target_class_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
      };
      poll_responses: {
        Row: {
          id: string;
          poll_id: string;
          user_id: string;
          response: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          user_id: string;
          response: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string;
          user_id?: string;
          response?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
