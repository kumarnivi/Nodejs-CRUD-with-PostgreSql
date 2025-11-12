import supabase from "../repository/supabaseClient";

export const getUserById = async (userId: number) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const createUser = async (userData: any) => {
  const { username, email, password, role, profileImage } = userData;
  
  const { data, error } = await supabase
    .from("users")
    .insert([{ username, email, password, role, profileImage }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
