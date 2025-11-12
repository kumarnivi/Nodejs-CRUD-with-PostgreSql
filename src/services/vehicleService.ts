import supabase from "../repository/supabaseClient";

// Create vehicle
export const createVehicle = async (dataset: any, imagePath: string) => {
  const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day } = dataset;

  if (!category_id || !name || !number_plate_no || !condition_vehicle || !location_id || !rent_per_day) {
    return { error: "All fields are required" };
  }

  // Check duplicate plate
  const { data: existingVehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("number_plate_no", number_plate_no)
    .single();

  if (existingVehicle) return { error: "Vehicle with this number plate already exists" };

  const { data, error } = await supabase
    .from("vehicles")
    .insert([{
      category_id,
      location_id,
      name,
      number_plate_no,
      image: imagePath,
      condition_vehicle,
      rent_per_day,
      availability_status: "available"
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// Get all vehicles
export const getAllVehicles = async () => {
  const { data, error } = await supabase.from("vehicles").select("*");
  if (error) throw new Error(error.message);
  return data;
};

// Update vehicle
export const updateVehicle = async (vehicle_id: number, data: any, imagePath?: string) => {
  const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day, availability_status } = data;

  const { data: updatedVehicle, error } = await supabase
    .from("vehicles")
    .update({
      category_id,
      location_id,
      name,
      number_plate_no,
      condition_vehicle,
      rent_per_day,
      image: imagePath,
      availability_status
    })
    .eq("id", vehicle_id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return updatedVehicle;
};
