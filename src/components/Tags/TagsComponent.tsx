import {
  Tag,
  TagCloseButton,
  TagLeftIcon,
  ChakraProvider,
} from "@chakra-ui/react";
import chakraTheme from "@/styles/chakraTheme";
import { AddIcon } from "@chakra-ui/icons";
import { z } from "zod";
import { Dispatch, useEffect, useState } from "react";
import SearchTagsComponent from "./SearchTagsComponent";
import { tagSchema, themeSchema } from "@/utils/types";
import { GameDataState } from "../GameScreen/GamePage";
import { gameBuildsMap } from "@/components/GameGallery/FilterBody";

const themeDataSchema = themeSchema.extend({
  _id: z.string().length(24),
});

const tagDataSchema = tagSchema.extend({
  _id: z.string().length(24),
});

interface Props {
  mode: string;
  gameData: GameDataState;
  setGameData: Dispatch<React.SetStateAction<GameDataState>>;
  admin?: boolean;
}

const sortByTagType = (
  tagA: z.infer<typeof tagDataSchema>,
  tagB: z.infer<typeof tagDataSchema>,
) => {
  if (tagA.type === "accessibility" && tagB.type !== "accessibility") {
    return -1;
  } else if (tagA.type !== "accessibility" && tagB.type === "accessibility") {
    return 1;
  }
  return 0;
};

export default function TagsComponent({
  mode,
  gameData,
  setGameData,
  admin,
}: Props) {
  const [search, setSearch] = useState(false);
  const [themes, setThemes] = useState<z.infer<typeof themeDataSchema>[]>(
    gameData?.themes,
  );
  const [tags, setTags] = useState<z.infer<typeof tagDataSchema>[]>(
    gameData?.tags,
  );

  useEffect(() => {
    if (setGameData && tags) {
      setGameData({
        ...gameData,
        tags: tags,
      });
    }
  }, [tags]);

  useEffect(() => {
    if (setGameData && themes) {
      setGameData({
        ...gameData,
        themes: themes,
      });
    }
  }, [themes]);

  function removeTag(tag: z.infer<typeof tagDataSchema>) {
    if (tags) {
      const newList = tags.filter((t) => {
        return t.name !== tag.name;
      });
      setTags(newList);
    }
  }

  function removeTheme(theme: z.infer<typeof themeDataSchema>) {
    if (themes) {
      const newList = themes.filter((t) => {
        return t.name !== theme.name;
      });
      setThemes(newList);
    }
  }

  return (
    <ChakraProvider theme={chakraTheme}>
      <div>
        <div className="flex flex-row flex-wrap font-inter text-base">
          {gameData?.videoTrailer ? <Tag>Video Trailer</Tag> : null}
          {gameData?.parentingGuide ? <Tag>Parenting Guide</Tag> : null}
          {gameData?.lesson ? <Tag>Lesson Plan</Tag> : null}
          {gameData?.answerKey && admin ? <Tag>Answer Key</Tag> : null}
          {gameData?.webGLBuild ? <Tag>WebGL</Tag> : null}
          {gameData?.builds
            ? gameData?.builds.map((build) => (
                <Tag key={build.type}>{gameBuildsMap[build.type]}</Tag>
              ))
            : null}
          {themes
            ? themes.map((theme) => (
                <Tag key={theme.name} bg="brand.400">
                  {theme.name}
                  {mode === "edit" ? (
                    <TagCloseButton onClick={() => removeTheme(theme)} />
                  ) : null}
                </Tag>
              ))
            : null}
          {tags
            ? tags.sort(sortByTagType).map((tag) => (
                <Tag
                  key={tag.name}
                  bg={tag.type === "accessibility" ? "brand.300" : "brand.500"}
                >
                  {tag.name}
                  {mode === "edit" ? (
                    <TagCloseButton onClick={() => removeTag(tag)} />
                  ) : null}
                </Tag>
              ))
            : null}
          {mode === "edit" && !search ? (
            <Tag
              className="cursor-pointer"
              bg="brand.600"
              color="white"
              onClick={() => {
                setSearch(true);
              }}
            >
              <TagLeftIcon color="white" boxSize="12px" as={AddIcon} />
              Add
            </Tag>
          ) : null}
        </div>
        {mode === "edit" && search && themes && tags ? (
          <div className="mt-10">
            <SearchTagsComponent
              setSearch={setSearch}
              currThemes={themes}
              setCurrThemes={setThemes}
              currTags={tags}
              setCurrTags={setTags}
            />
          </div>
        ) : null}
      </div>
    </ChakraProvider>
  );
}
