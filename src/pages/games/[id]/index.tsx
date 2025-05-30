import GamePage from "@/components/GameScreen/GamePage";
import React from "react";
import { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { getGameById } from "@/server/db/actions/GameAction";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { id } = ctx.query;

  if (!id || id === "create") {
    return {
      notFound: true,
    };
  }
  try {
    const data = await getGameById(ctx.query.id as string);
    const gameData = JSON.parse(JSON.stringify(data));
    return {
      props: {
        gameData,
      },
    };
  } catch (error) {
    console.error("Error fetching game data:", error);
    return {
      props: {
        gameData: null,
      },
    };
  }
};

function ViewGame({
  gameData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <GamePage mode="view" gameData={gameData} />
    </>
  );
}

export default ViewGame;
