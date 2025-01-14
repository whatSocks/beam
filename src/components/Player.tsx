import React from "react";
import { css } from "@emotion/css";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

import { useGlobalStateContext } from "../contexts/globalState";
import { fetchTrack, registerPlay } from "../services/Api";
import { MdQueueMusic } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { bp } from "../constants";
import { FavoriteTrack } from "./common/FavoriteTrack";
import { buildStreamURL, mapFavoriteAndPlaysToTracks } from "../utils/tracks";
import Button from "./common/Button";
import { isTrackWithUserCounts } from "../typeguards";
import ImageWithPlaceholder from "./common/ImageWithPlaceholder";

const playerClass = css`
  min-height: 48px;
  border-bottom: 1px solid grey;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  position: fixed;
  width: 100%;
  z-index: 10;
  bottom: 0;
  background-color: #fff;

  @media (max-width: ${bp.small}px) {
    height: 150px;
    flex-direction: column;
  }
`;

const trackInfo = css`
  display: flex;
  align-items: center;
  flex-grow: 1;

  img {
    margin-right: 1rem;
  }

  @media (max-width: ${bp.small}px) {
    width: 100%;
    align-items: flex-start;
    // justify-content: ;
  }
`;

const Player = () => {
  const {
    state: { playerQueueIds, user, playing },
    dispatch,
  } = useGlobalStateContext();
  let navigate = useNavigate();
  const playerRef = React.useRef<any>();
  const [currentTrack, setCurrentTrack] = React.useState<
    TrackWithUserCounts | Track
  >();
  const [mostlyListened, setMostlyListened] = React.useState(false);

  const fetchTrackCallback = React.useCallback(
    async (id: number) => {
      const track = await fetchTrack(id);
      if (user) {
        const mappedTrack = (await mapFavoriteAndPlaysToTracks([track]))[0];
        setCurrentTrack(mappedTrack);
      } else {
        setCurrentTrack(track);
      }
    },
    [user]
  );

  React.useEffect(() => {
    if (playerQueueIds && playerQueueIds[0]) {
      fetchTrackCallback(playerQueueIds[0]);
    }
  }, [fetchTrackCallback, playerQueueIds]);

  const onEnded = React.useCallback(async () => {
    if (!mostlyListened && currentTrack && user) {
      try {
        await registerPlay(user?.id, currentTrack.id);
      } catch (e) {
        console.error(e);
      }
    }
    dispatch({ type: "popFromFrontOfQueue" });
    setMostlyListened(false);
  }, [currentTrack, dispatch, mostlyListened, user]);

  const onClickQueue = React.useCallback(() => {
    navigate("/library/queue");
  }, [navigate]);

  const onListen = React.useCallback(
    async (e) => {
      if (
        !mostlyListened &&
        currentTrack &&
        user &&
        e.target.currentTime > 45
      ) {
        setMostlyListened(true);
        try {
          // FIXME: the v1 API doesn't allow play registration from localhost:8080
          await registerPlay(user?.id, currentTrack.id);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [currentTrack, mostlyListened, user]
  );

  React.useEffect(() => {
    if (playerRef?.current && playing && !playerRef.current.isPlaying()) {
      playerRef.current.audio.current.play();
    } else if (
      playerRef?.current &&
      !playing &&
      playerRef.current.isPlaying()
    ) {
      playerRef.current.audio.current.pause();
    }
  }, [playing]);

  const onPause = React.useCallback(() => {
    dispatch({ type: "setPlaying", playing: false });
  }, [dispatch]);

  const onPlay = React.useCallback(() => {
    dispatch({ type: "setPlaying", playing: true });
  }, [dispatch]);

  return (
    <div className={playerClass}>
      {currentTrack && (
        <div className={trackInfo}>
          <ImageWithPlaceholder
            src={currentTrack.images.small?.url ?? currentTrack.cover}
            size={50}
            alt={currentTrack.title}
            className={css`
              background-color: #efefef;
            `}
          />
          <div>
            <div>{currentTrack.title}</div>
            <div>{currentTrack.album}</div>
            <div>{currentTrack.artist}</div>
          </div>
          {isTrackWithUserCounts(currentTrack) && user && (
            <div
              className={css`
                flex-grow: 1;
                text-align: right;
                padding-right: 1rem;
              `}
            >
              <FavoriteTrack track={currentTrack} />
            </div>
          )}
        </div>
      )}
      {!currentTrack && (
        <div className={trackInfo}>
          Current queue is empty, click on something to play!
        </div>
      )}
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-grow: 1;
          @media (max-width: ${bp.small}px) {
            width: 100%;
          }
        `}
      >
        {playerQueueIds.length > 0 && (
          <AudioPlayer
            src={buildStreamURL(playerQueueIds[0], user?.clientId)}
            ref={playerRef}
            onEnded={onEnded}
            onPause={onPause}
            onPlay={onPlay}
            onListen={onListen}
            layout="horizontal"
            className={css`
              &.rhap_container {
                box-shadow: none;
                padding: 0;
              }
            `}
          />
        )}
        <Button
          onClick={onClickQueue}
          compact
          variant="outlined"
          className={css`
            margin-left: 2rem;
            @media (max-width: ${bp.small}px) {
              display: none;
            }
          `}
          startIcon={<MdQueueMusic style={{}} />}
        >
          Queue
        </Button>
      </div>
    </div>
  );
};

export default Player;
