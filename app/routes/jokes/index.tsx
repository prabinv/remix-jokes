import { Joke } from "@prisma/client";
import { Link, LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";

type LoaderData = {
  randomJoke: Joke;
};

export let loader: LoaderFunction = async () => {
  let count = await db.joke.count();
  let [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: Math.floor(Math.random() * count),
  });
  return { randomJoke };
}

export default function JokesIndexRoute() {
  const { randomJoke } = useLoaderData<LoaderData>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>
        {randomJoke.content}
      </p>
      <Link to={randomJoke.id}>
        "{randomJoke.name}" Permalink
      </Link>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      I did a whoopsies.
    </div>
  );
}
