import { supabase, Lead } from '../lib/supabase';
import { computeScore } from './score';

export const leadsService = {
  // Get all leads for the current user
  async getLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single lead by ID
  async getLead(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Create a new lead with automatic scoring
  async createLead(lead: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'score'>): Promise<Lead> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Compute score before inserting
    const computedScore = computeScore(lead);

    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...lead, user_id: user.id, score: computedScore }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a lead with score recalculation
  async updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'score'>>): Promise<Lead> {
    // Get current lead data to compute new score
    const currentLead = await this.getLead(id);
    if (!currentLead) throw new Error('Lead not found');

    // Merge current data with updates for scoring
    const updatedData = { ...currentLead, ...updates };
    const computedScore = computeScore(updatedData);

    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, score: computedScore })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a lead
  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get leads statistics
  async getStats(): Promise<{
    totalLeads: number;
    averageScore: number;
    leadsByStatus: { status: string; count: number }[];
  }> {
    const leads = await this.getLeads();

    const totalLeads = leads.length;
    const averageScore = leads.length > 0
      ? Math.round(leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length)
      : 0;

    // Count leads by status
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const leadsByStatus = Object.entries(statusCounts).map(([status, count]): { status: string; count: number } => ({
      status,
      count: count as number,
    }));

    return {
      totalLeads,
      averageScore,
      leadsByStatus,
    };
  },

  // Get top leads by score (for TopLeads component)
  async getTopLeads(limit: number = 5): Promise<Lead[]> {
    const leads = await this.getLeads();
    
    return leads
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Subscribe to real-time changes
  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('leads-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        callback
      )
      .subscribe();
  },
};
