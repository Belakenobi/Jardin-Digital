import { getProfile, updateProfile } from "../services/profile.service.js";

export async function getMyProfile(request, response, next) {
  try {
    const profile = await getProfile(
      request.supabase,
      request.user.id
    );

    return response.status(200).json({
      status: "success",
      profile,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMyProfile(request, response, next) {
  try {
    const { displayName } = request.body;

    if (
      typeof displayName !== "string" ||
      displayName.trim().length === 0
    ) {
      return response.status(400).json({
        status: "error",
        message: "displayName is required",
      });
    }

    const profile = await updateProfile(
      request.supabase,
      request.user.id,
      displayName.trim()
    );

    return response.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    return next(error);
  }
}
