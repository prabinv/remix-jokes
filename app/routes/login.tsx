import { ActionFunction, Form, LinksFunction, MetaFunction, useActionData } from "remix";
import { Link, useSearchParams } from "remix";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";
import stylesUrl from "../styles/login.css";

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};


export let meta: MetaFunction = () => {
  return {
    title: "Remix Jokes | Login",
    description:
      "Login to submit your own jokes to Remix Jokes!"
  };
};


type ActionData = {
  formError?: string;
  fieldErrors?: {
    username?: string;
    password?: string;
  },
  fields?: {
    username: string;
    password: string;
  };
}; 


export let action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const username = form.get("username");
  const password = form.get("password");
  const requestUrl = new URL(request.url);
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/jokes";

  if (typeof loginType !== "string" || typeof username !== "string" || typeof password !== "string") {
    return {
      formError: "Please fill out the form completely",
    }
  }

  const fields = {
    username,
    password,
  };

  switch (loginType) {
    case "login":
      let user = await login(fields);
      if (!user) {
        return {
          fields,
          formError: "Username / Password combination is incorrect",
        }
      }
      return createUserSession(user.id, redirectTo);
    case "register":
      let userExists = await db.user.findFirst({
        where: {
          username,
        },
      });
      if (userExists) {
        return {
          fields,
          formError: `User with username ${username} already exists`,
        };
      }
      const newUser = await register(fields);
      if (!newUser) {
        return {
          fields,
          formError: "Something went wrong trying to create a new user",
        };
      }
      return createUserSession(newUser.id, redirectTo);
    default:
      return {
        fields,
        formError: "Login type invalid",
      };
  }
};


export default function Login() {
  let [searchParams] = useSearchParams();
  const actionData = useActionData<ActionData | undefined>();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
            />
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
              defaultValue={actionData?.fields?.password}
            />
          </div>
          <div className="form-error-message">
            {actionData?.formError ? (
              <p
                className="form-validation-error"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
