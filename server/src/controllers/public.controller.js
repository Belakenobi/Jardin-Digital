import {
  getPublicGarden,
  getPublicGardens,
} from "../services/public.service.js";
import { createSupabaseClient } from "../config/supabase.js";

export async function listPublicGardens(request, response, next) {
  try {
    const supabase = createSupabaseClient();
    const gardens = await getPublicGardens(supabase);

    return response.status(200).json({
      status: "success",
      data: { gardens },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicGardenById(
  request,
  response,
  next
) {
  try {
    const { gardenId } = request.params;

    const supabase =
      createSupabaseClient();

    const data = await getPublicGarden(
      supabase,
      gardenId
    );

    if (!data) {
      return response.status(404).json({
        status: "error",
        message: "Este jardín no está disponible o ya no es público.",
      });
    }

    return response.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return next(error);
  }
}
