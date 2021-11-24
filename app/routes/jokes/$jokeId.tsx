import { Joke } from "@prisma/client";
import { LoaderFunction, useLoaderData, RequestHandler, Link } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = { joke: Joke };

export let loader: LoaderFunction = async ({ params }) => {
  const { jokeId } = params;
  let joke = await db.joke.findUnique({
    where: {
      id: jokeId
    },
  });
  if (!joke) {
    throw new Error(`Joke with id ${jokeId} not found`);
  }
  let data: LoaderData = { joke };
  return data;
};

export default function JokeRoute() {
  const { joke } = useLoaderData<LoaderData>();
  
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>
        {joke?.content}
      </p>
      <Link to=".">{joke?.name} Permalink</Link>
    </div>
  );
}
