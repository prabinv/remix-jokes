import { ActionFunction, redirect, Form, useActionData } from "remix";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return "Joke content must be at least 10 characters long";
  }
}

function validateJokeName(name: string) {
  if (name.length < 2) {
    return "Joke name must be at least 3 characters long";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    content?: string;
    name?: string;
  },
  fields?: {
    content: string;
    name: string;
  };
}; 

export let action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  let userId = await requireUserId(request);
  let form = await request.formData();
  let name = form.get("name");
  let content = form.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    return {
      formError: "Please fill out the form completely",
    };
  }

  let fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content),
  };
  let fields = {
    name,
    content,
  };

  if (Object.values(fieldErrors).some(error => error !== undefined)) {
    return {
      fieldErrors,
      fields,
    };
  }

  let joke = await db.joke.create({ data: { ...fields, jokesterId: userId, } });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  let actionData = useActionData<ActionData | undefined>();
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <Form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              defaultValue={actionData?.fields?.name}
              aria-invalid={actionData?.fieldErrors?.name !== undefined || undefined}
              aria-describedby={actionData?.fieldErrors?.name !== undefined ? "name-error" : undefined}
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              role="alert"
              id="name-error"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              defaultValue={actionData?.fields?.content}
              name="content"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.content) ||
                undefined
              }
              aria-describedby={
                actionData?.fieldErrors?.content
                  ? "content-error"
                  : undefined
              }/>
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </Form>
    </div>
  );
}
