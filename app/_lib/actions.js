"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();

  if (!session) throw new Error("Not logged in");

  const nationalId = formData.get("nationalId");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalId)) {
    throw new Error("Invalid National ID");
  }

  const updateData = {
    nationalId,
    nationality,
    countryFlag,
  };

  const { data, error } = await supabase
    .from("wildoasis_guest")
    .update(updateData)
    .eq("id", session.user.guestid);

  if (error) {
    console.error(error);
    throw new Error("Guest could not be updated");
  }

  revalidatePath("/account/profile");
}

export async function deleteBooking(bookingId) {
  const session = await auth();

  if (!session) throw new Error("Not logged in");

  const guestBookings = await getBookings(session.user.guestid);
  const bookingIds = guestBookings.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId)) {
    throw new Error("You do not have permission to delete this reservation");
  }

  const { error } = await supabase
    .from("wildoasis_booking")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be deleted");
  }

  revalidatePath("/account/reservations");
}

export async function createBooking(bookingData, formData) {
  const session = await auth();
  if (!session) throw new Error("Not logged in");

  const newBooking = {
    ...bookingData,
    guestId: session.user.guestid,
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extrasPrice: 0,
    totalPrice: bookingData.cabinPrice,
    isPaid: false,
    hasBreakfast: false,
    status: "unconfirmed",
  };

  const { error } = await supabase
    .from("wildoasis_booking")
    .insert([newBooking]);

  if (error) {
    console.error(error);
    throw new Error("Booking could not be created");
  }

  revalidatePath(`/cabins/${bookingData.cabinId}`);

  redirect("/cabins/thankyou");
}

export async function updateBooking(formData) {
  const bookingId = Number(formData.get("bookingId"));

  const session = await auth();

  if (!session) throw new Error("Not logged in");

  const guestBookings = await getBookings(session.user.guestid);
  const bookingIds = guestBookings.map((booking) => booking.id);
  if (!bookingIds.includes(bookingId)) {
    throw new Error("You do not have permission to update this reservation");
  }

  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabase
    .from("wildoasis_booking")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error("Booking could not be updated");
  }

  revalidatePath("/account/reservations");
  revalidatePath(`/account/reservations/edit/${bookingId}`);

  redirect("/account/reservations");
}

export async function signInAction() {
  await signIn("google", {
    redirectTo: "/account",
  });
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}
