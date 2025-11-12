import supabase from "../repository/supabaseClient";

export const getLocations = async () => {
  const { data, error } = await supabase.from("location").select("*");
  if (error) throw new Error(error.message);
  return data;
};

export const createLocation = async (name: string) => {
  const normalizedName = name.toLowerCase().trim();
  const { data: existing } = await supabase
    .from("location")
    .select("*")
    .ilike("name", normalizedName)
    .single();

  if (existing) return { existing: true, ...existing };

  const { data, error } = await supabase.from("location").insert([{ name }]).select().single();
  if (error) throw new Error(error.message);
  return { existing: false, ...data };
};
