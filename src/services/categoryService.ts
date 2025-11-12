import supabase from "../repository/supabaseClient";

export const getCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const createCategory = async (name: string) => {
  const { data: existing } = await supabase.from("categories").select("*").eq("name", name).single();
  if (existing) return { existing: true, ...existing };

  const { data, error } = await supabase.from("categories").insert([{ name }]).select().single();
  if (error) throw new Error(error.message);
  return data;
};
