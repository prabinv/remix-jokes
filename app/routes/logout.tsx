import { ActionFunction, LoaderFunction, redirect } from "remix";
import { logout } from "~/utils/session.server";

export let action: ActionFunction = async ({ request }): Promise<Response> => {
  return logout(request);
};

export let loader: LoaderFunction = async () => {
  return redirect("/");
};
