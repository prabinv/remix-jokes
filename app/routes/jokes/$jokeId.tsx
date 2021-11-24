import { useLoaderData } from "remix";

type Joke = { 
  id: string,
  joke: string,
  status: string,
}

export async function loader(): Promise<{ joke: Joke }> {
  const response = await fetch("https://icanhazdadjoke.com/", {
    headers: {
      Accept: "application/json",
    },
  });
  return response.json();
}

export default function JokeRoute() {
  const joke = useLoaderData();
  
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>
        {joke?.joke}
      </p>
    </div>
  );
}
