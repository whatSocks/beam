import { css } from "@emotion/css";
import { random } from "lodash";
import React from "react";
import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useGlobalStateContext } from "../contexts/globalState";

import { fetchTrackGroup } from "../services/Api";
import Button from "./common/Button";
import { CenteredSpinner } from "./common/Spinner";
import TrackList from "./common/TrackList";

const staffPicks = [
  "c4251486-680f-4cb9-8eed-87afccf5c29d",
  "2e6d1aa3-cee0-4df9-8621-46e2c0c2993c",
  "856e3176-e5e3-4d89-b5d9-a676258411b7",
  "2bf25c61-e44b-4cde-b500-523ca38ec9d8",
  "486e1abd-99f0-4acd-b1f0-01ebe36d3dda",
];

const StaffPicks: React.FC = () => {
  const { dispatch } = useGlobalStateContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const [latestStaffPick, setLatestStaffPick] =
    React.useState<TrackgroupDetail>();
  const [tracks, setTracks] = React.useState<Track[]>();

  const fetchStaffPicksCallback = React.useCallback(async () => {
    setIsLoading(true);
    const result = await fetchTrackGroup(
      staffPicks[random(staffPicks.length - 1)]
    );
    setLatestStaffPick(result);

    setTracks(result?.items.map((item) => item.track));
    setIsLoading(false);
  }, []);

  const onPlayClick = React.useCallback(() => {
    if (tracks) {
      dispatch({
        type: "setPlayerQueueIds",
        playerQueueIds: tracks?.map((track) => track.id) ?? [],
      });
      dispatch({
        type: "setPlaying",
        playing: true,
      });
    }
  }, [dispatch, tracks]);

  React.useEffect(() => {
    fetchStaffPicksCallback();
  }, [fetchStaffPicksCallback]);

  return (
    <div className={css``}>
      <div
        className={css`
          padding-bottom: 1rem;
        `}
      >
        <h3>Staff picks</h3>
        <p
          className={css`
            margin-bottom: 1rem;
          `}
        >
          Playlists by the people building Resonate showcasing some of their
          favorite music
        </p>
        {isLoading && <CenteredSpinner />}
        {latestStaffPick && (
          <div
            className={css`
              display: flex;
              align-items: center;

              > h4 {
                margin-bottom: 0;
                padding-bottom: 0;
                padding-right: 1rem;
              }
            `}
          >
            <h4>
              <Link to={`/library/trackgroup/${latestStaffPick.id}`}>
                {latestStaffPick.title}
              </Link>
            </h4>
            {tracks && (
              <Button compact startIcon={<FaPlay />} onClick={onPlayClick}>
                Play
              </Button>
            )}
          </div>
        )}
        {latestStaffPick?.about}
      </div>

      {tracks && <TrackList tracks={tracks} />}
    </div>
  );
};

export default StaffPicks;
