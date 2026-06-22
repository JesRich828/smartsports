export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      board_members: {
        Row: {
          created_at: string
          giveGoal: number
          given: number
          id: string
          introductions: number
          meetingsScheduled: number
          name: string
          prospectsAssigned: number
          sponsorOutreach: number
        }
        Insert: {
          created_at?: string
          giveGoal?: number
          given?: number
          id?: string
          introductions?: number
          meetingsScheduled?: number
          name?: string
          prospectsAssigned?: number
          sponsorOutreach?: number
        }
        Update: {
          created_at?: string
          giveGoal?: number
          given?: number
          id?: string
          introductions?: number
          meetingsScheduled?: number
          name?: string
          prospectsAssigned?: number
          sponsorOutreach?: number
        }
        Relationships: []
      }
      donors: {
        Row: {
          askAmount: number
          connection: string
          created_at: string
          givingCapacity: string
          id: string
          interestArea: string
          lastContact: string
          name: string
          nextStep: string
          notes: string
          organization: string
          stage: string
          type: string
        }
        Insert: {
          askAmount?: number
          connection?: string
          created_at?: string
          givingCapacity?: string
          id?: string
          interestArea?: string
          lastContact?: string
          name?: string
          nextStep?: string
          notes?: string
          organization?: string
          stage?: string
          type?: string
        }
        Update: {
          askAmount?: number
          connection?: string
          created_at?: string
          givingCapacity?: string
          id?: string
          interestArea?: string
          lastContact?: string
          name?: string
          nextStep?: string
          notes?: string
          organization?: string
          stage?: string
          type?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          boardGivingGoal: number
          cashGoal: number
          channels: Json
          created_at: string
          id: string
          inKindGoal: number
          totalExpenses: number
          totalRevenueGoal: number
        }
        Insert: {
          boardGivingGoal?: number
          cashGoal?: number
          channels?: Json
          created_at?: string
          id?: string
          inKindGoal?: number
          totalExpenses?: number
          totalRevenueGoal?: number
        }
        Update: {
          boardGivingGoal?: number
          cashGoal?: number
          channels?: Json
          created_at?: string
          id?: string
          inKindGoal?: number
          totalExpenses?: number
          totalRevenueGoal?: number
        }
        Relationships: []
      }
      golf_auction: {
        Row: {
          created_at: string
          donor: string
          estimatedValue: number
          id: string
          item: string
          type: string
        }
        Insert: {
          created_at?: string
          donor?: string
          estimatedValue?: number
          id?: string
          item?: string
          type?: string
        }
        Update: {
          created_at?: string
          donor?: string
          estimatedValue?: number
          id?: string
          item?: string
          type?: string
        }
        Relationships: []
      }
      golf_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          item: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          item?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          item?: string
        }
        Relationships: []
      }
      golf_foursomes: {
        Row: {
          amount: number
          captain: string
          created_at: string
          id: string
          organization: string
          paid: boolean
          players: number
        }
        Insert: {
          amount?: number
          captain?: string
          created_at?: string
          id?: string
          organization?: string
          paid?: boolean
          players?: number
        }
        Update: {
          amount?: number
          captain?: string
          created_at?: string
          id?: string
          organization?: string
          paid?: boolean
          players?: number
        }
        Relationships: []
      }
      golf_players: {
        Row: {
          amount: number
          created_at: string
          id: string
          name: string
          organization: string
          paid: boolean
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          organization?: string
          paid?: boolean
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          organization?: string
          paid?: boolean
        }
        Relationships: []
      }
      golf_sponsors: {
        Row: {
          amount: number
          confirmed: boolean
          created_at: string
          followUp: string
          id: string
          level: string
          name: string
        }
        Insert: {
          amount?: number
          confirmed?: boolean
          created_at?: string
          followUp?: string
          id?: string
          level?: string
          name?: string
        }
        Update: {
          amount?: number
          confirmed?: boolean
          created_at?: string
          followUp?: string
          id?: string
          level?: string
          name?: string
        }
        Relationships: []
      }
      grants: {
        Row: {
          amountRequested: number
          applicationDueDate: string
          assignedOwner: string
          awardAmount: number
          contactEmail: string
          contactName: string
          created_at: string
          deadline: string
          decisionDate: string
          declinedReason: string
          documentsNeeded: string
          funderName: string
          fundingType: string
          geographicFocus: string
          id: string
          likelihood: string
          loiDueDate: string
          nextStep: string
          notes: string
          priorityArea: string
          programFit: string
          relationshipNotes: string
          renewalOpportunity: boolean
          reportDueDate: string
          status: string
          submittedDate: string
        }
        Insert: {
          amountRequested?: number
          applicationDueDate?: string
          assignedOwner?: string
          awardAmount?: number
          contactEmail?: string
          contactName?: string
          created_at?: string
          deadline?: string
          decisionDate?: string
          declinedReason?: string
          documentsNeeded?: string
          funderName?: string
          fundingType?: string
          geographicFocus?: string
          id?: string
          likelihood?: string
          loiDueDate?: string
          nextStep?: string
          notes?: string
          priorityArea?: string
          programFit?: string
          relationshipNotes?: string
          renewalOpportunity?: boolean
          reportDueDate?: string
          status?: string
          submittedDate?: string
        }
        Update: {
          amountRequested?: number
          applicationDueDate?: string
          assignedOwner?: string
          awardAmount?: number
          contactEmail?: string
          contactName?: string
          created_at?: string
          deadline?: string
          decisionDate?: string
          declinedReason?: string
          documentsNeeded?: string
          funderName?: string
          fundingType?: string
          geographicFocus?: string
          id?: string
          likelihood?: string
          loiDueDate?: string
          nextStep?: string
          notes?: string
          priorityArea?: string
          programFit?: string
          relationshipNotes?: string
          renewalOpportunity?: boolean
          reportDueDate?: string
          status?: string
          submittedDate?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          accent_color: string
          created_at: string
          id: string
          logo_initials: string
          org_name: string
          primary_color: string
          tagline: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          id?: string
          logo_initials?: string
          org_name?: string
          primary_color?: string
          tagline?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          id?: string
          logo_initials?: string
          org_name?: string
          primary_color?: string
          tagline?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          commitment: number | null
          company: string
          contact: string | null
          created_at: string
          id: string
          sponsorship_level: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          commitment?: number | null
          company: string
          contact?: string | null
          created_at?: string
          id?: string
          sponsorship_level?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          commitment?: number | null
          company?: string
          contact?: string | null
          created_at?: string
          id?: string
          sponsorship_level?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
