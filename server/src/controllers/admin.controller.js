import {
  getAdminSummary,
  getAdminUsers,
} from "../services/admin.service.js";

export async function getSummary(request, response, next) {
  try {
    const summary = await getAdminSummary(request.supabase);

    return response.status(200).json({
      status: "success",
      data: {
        summary,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUsers(request, response, next) {
  try {
    const users = await getAdminUsers(request.supabase);

    return response.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (error) {
    return next(error);
  }
}
