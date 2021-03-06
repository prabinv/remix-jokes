import { Joke } from "@prisma/client";
import { LoaderFunction, useLoaderData, Link, useParams, ActionFunction, redirect, useCatch, Form, MetaFunction } from "remix";
import { JokeDisplay } from "~/components/joke";
import { db } from "~/utils/db.server";
import { getUserId } from "~/utils/session.server";

type LoaderData = { 
  joke: Joke,
  isOwner: boolean,
};

export let meta: MetaFunction = ({
  data
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found"
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`
  };
};

export let loader: LoaderFunction = async ({ params, request }) => {
  const { jokeId } = params;
  const userId = await getUserId(request);
  let joke = await db.joke.findUnique({
    where: {
      id: jokeId
    },
  });
  if (!joke) {
    throw new Error(`Joke with id ${jokeId} not found`);
  }
  let data: LoaderData = { 
    joke,
    isOwner: !!userId && joke.jokesterId === userId,
  };
  return data;
};

export let action: ActionFunction = async ({ params, request }) => {
  let form = await request.formData();
  if (form.get("_method") === "delete") {
    let userId = await getUserId(request);
    let joke = await db.joke.findUnique({
      where: {
        id: params.jokeId
      },
    });
    if (!joke) {
      throw new Response('Can\'t find joke', {
        status: 404,
      });
    }
    if (joke.jokesterId !== userId) {
      throw new Response("Pssh, nice try. That's not your joke", {
        status: 401,
      });
    }
    await db.joke.delete({
      where: {
        id: params.jokeId,
      },
    });
    return redirect("/jokes");
  }
};

export default function JokeRoute() {
  const { joke, isOwner } = useLoaderData<LoaderData>();
  
  return (
    <JokeDisplay joke={joke} isOwner={isOwner} />
  );
}

export function CatchBoundary() {
  let caught = useCatch();
  let params = useParams();
  switch (caught.status) {
    case 404:
      return (
        <div className="error-container">
          Can't find joke with id {params.jokeId}
        </div>
      );
    case 401:
      return (
        <div className="error-container">
          Sorry, you can't delete someone else's joke
        </div>
      );
    default:
      throw new Error(`Unhandled error: ${caught.status} - ${caught.data}`);      
  }
}

export function ErrorBoundary() {
  let { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry!`}</div>
  );
}
