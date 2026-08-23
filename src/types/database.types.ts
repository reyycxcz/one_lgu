// Type definitions matching the Supabase schema.
// Replace this with auto-generated types using: npx supabase gen types typescript

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      barangays: {
        Row: {
          id: string;
          name: string;
          code: string;
          municipality: string;
          province: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["barangays"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["barangays"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          barangay_id: string | null;
          role: "super_admin" | "barangay_official" | "lgu_reviewer" | "resident";
          position: "captain" | "secretary" | "treasurer" | null;
          department: "mayor_office" | "vice_mayor_office" | "administrator_office" | "treasurer_office" | "assessor_office" | "budget_office" | "accounting_office" | "planning_office" | "civil_registrar_office" | "health_office" | "social_welfare_office" | "agriculture_office" | "engineering_office" | "drrm_office" | "business_permits_office" | "hr_office" | "general_services_office" | null;
          full_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      certification_requests: {
        Row: {
          id: string;
          requester_id: string;
          barangay_id: string;
          type: "barangay_clearance" | "certificate_of_residency" | "certificate_of_indigency" | "business_clearance" | "first_time_job_seeker";
          purpose: string;
          status: "submitted" | "verified" | "approved" | "rejected" | "generated" | "ready_for_pickup" | "released";
          requirements: Json;
          verified_by: string | null;
          verified_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          rejected_reason: string | null;
          generated_document_url: string | null;
          released_at: string | null;
          released_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["certification_requests"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["certification_requests"]["Insert"]>;
      };
      complaints: {
        Row: {
          id: string;
          complainant_id: string;
          barangay_id: string;
          record_type: "service_report" | "formal_complaint";
          type: string;
          respondent_name: string | null;
          subject: string;
          description: string;
          status: "submitted" | "under_review" | "scheduled" | "mediation" | "resolved" | "closed" | "assigned" | "in_progress" | "rejected" | "notice_summons" | "pangkat_conciliation" | "settled" | "not_settled";
          attachments: Json;
          priority: "low" | "medium" | "high" | "urgent";
          location: string | null;
          incident_at: string | null;
          is_anonymous: boolean;
          assigned_to: string | null;
          assigned_to_label: string | null;
          assigned_at: string | null;
          scheduled_date: string | null;
          mediation_notes: string | null;
          notice_issued_at: string | null;
          notice_details: string | null;
          pangkat_members: string | null;
          pangkat_notes: string | null;
          rejected_reason: string | null;
          resolution: string | null;
          resolved_at: string | null;
          closed_by: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["complaints"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["complaints"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          submitted_by: string;
          barangay_id: string;
          type: "monthly" | "financial" | "accomplishment" | "compliance" | "other";
          title: string;
          period_start: string | null;
          period_end: string | null;
          status: "submitted" | "under_review" | "approved" | "rejected" | "archived";
          file_url: string;
          file_name: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          barangay_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          title: string;
          message: string;
          type: string;
          entity_type: string | null;
          entity_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Enums: {
      user_role: "super_admin" | "barangay_official" | "lgu_reviewer" | "resident";
      barangay_position: "captain" | "secretary" | "treasurer";
      lgu_department: "mayor_office" | "vice_mayor_office" | "administrator_office" | "treasurer_office" | "assessor_office" | "budget_office" | "accounting_office" | "planning_office" | "civil_registrar_office" | "health_office" | "social_welfare_office" | "agriculture_office" | "engineering_office" | "drrm_office" | "business_permits_office" | "hr_office" | "general_services_office";
      certification_type: "barangay_clearance" | "certificate_of_residency" | "certificate_of_indigency" | "business_clearance" | "first_time_job_seeker";
      certification_status: "submitted" | "verified" | "approved" | "rejected" | "generated" | "ready_for_pickup" | "released";
      complaint_status: "submitted" | "under_review" | "scheduled" | "mediation" | "resolved" | "closed" | "assigned" | "in_progress" | "rejected" | "notice_summons" | "pangkat_conciliation" | "settled" | "not_settled";
      complaint_record_type: "service_report" | "formal_complaint";
      report_type: "monthly" | "financial" | "accomplishment" | "compliance" | "other";
      report_status: "submitted" | "under_review" | "approved" | "rejected" | "archived";
    };
  };
}
