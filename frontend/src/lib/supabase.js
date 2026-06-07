import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getOrCreateProfile = async (userId) => {
  try {
    // 1. Tenta buscar o perfil existente
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && profile) {
      return { data: profile, error: null };
    }

    // 2. Se não encontrou o perfil (código PGRST116), tenta criar usando os metadados da sessão
    if (error && error.code === 'PGRST116') {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user && user.id === userId) {
        const newProfile = {
          id: userId,
          name: user.user_metadata?.name || '',
          whatsapp: user.user_metadata?.whatsapp || '',
          is_approved: false,
          role: 'user'
        };

        const { data: createdProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (!insertError) {
          console.log('Perfil auto-criado com sucesso via fallback do frontend:', createdProfile);
          return { data: createdProfile, error: null };
        }
        console.error('Erro ao auto-criar perfil no fallback:', insertError);
        return { data: null, error: insertError };
      }
    }

    return { data: null, error };
  } catch (err) {
    console.error('Exceção ao obter/criar perfil:', err);
    return { data: null, error: err };
  }
};
