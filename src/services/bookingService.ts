import supabase from "../repository/supabaseClient";

// Book vehicle
export const bookVehicle = async (userId: number, data: any) => {
  const { vehicle_id, rent_started_date, rent_ended_date, user_nic } = data;

  // Get vehicle
  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicle_id)
    .eq("availability_status", "available")
    .single();

  if (vehicleError || !vehicle) throw new Error("Vehicle not available");

  // Calculate total payment
  const startDate = new Date(rent_started_date);
  const endDate = new Date(rent_ended_date);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalPayment = totalDays * vehicle.rent_per_day;

  // Insert booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([{
      user_id: userId,
      user_nic,
      vehicle_id,
      category_type: vehicle.category_id,
      rent_started_date: startDate,
      rent_ended_date: endDate,
      total_payment: totalPayment
    }])
    .select()
    .single();

  if (bookingError) throw new Error(bookingError.message);

  // Update vehicle status
  await supabase.from("vehicles").update({ availability_status: "booked" }).eq("id", vehicle_id);

  return booking;
};

// Get all bookings
export const getAllBookings = async () => {
  const { data, error } = await supabase.from("bookings").select("*");
  if (error) throw new Error(error.message);
  return data;
};
